/**
 * Moteur du site : besoin de chauffage (degrés-jours Météo-France), consommation et coût avant / après,
 * MaPrimeRénov' 2026 par geste, prime CEE (BAR-TH-171 / 172, Coup de pouce), écrêtement du décret
 * n° 2020-26, reste à charge et temps de retour. Tous les chiffres viennent de data/params-2026.json.
 */
import { P } from './params';
import DEPS from '../../data/pac/departements.json';

export type TypePac = 'air_eau' | 'geo' | 'air_air';
export type Energie = 'fioul' | 'gaz' | 'elec';
export type Couleur = 'bleu' | 'jaune' | 'violet' | 'rose';
export type Iso = 'faible' | 'moyenne' | 'bonne' | 'bbc';
export type Logement = 'maison' | 'appartement';
export type Zone = 'H1' | 'H2' | 'H3';

export interface Station { n: string; a: number; d: number; t: number | null }
export interface Dep {
  code: string; nom: string; region: string; chefLieu: string; zone: Zone; idf: boolean; emprunt: boolean;
  station: string; stationAlt: number; dju: number; dju2025: number | null; stationKm: number;
  tbase: number; tbaseStation: string; stations: Station[];
}
export const DEPARTEMENTS = DEPS as unknown as Dep[];
export const depByCode = (code: string): Dep => {
  const d = DEPARTEMENTS.find((x) => x.code === code);
  if (!d) throw new Error(`Département inconnu : ${code}`);
  return d;
};

/* ---------- Catégorie de revenus (plafonds Anah 2026) ---------- */
const plafond = (t: { base: number[]; plus: number }, personnes: number) => {
  const n = Math.max(1, Math.round(personnes));
  return n <= 5 ? t.base[n - 1] : t.base[4] + (n - 5) * t.plus;
};
export function plafondsRfr(personnes: number, idf: boolean): Record<'bleu' | 'jaune' | 'violet', number> {
  const T = idf ? P.plafonds_rfr.idf : P.plafonds_rfr.hors_idf;
  return { bleu: plafond(T.bleu, personnes), jaune: plafond(T.jaune, personnes), violet: plafond(T.violet, personnes) };
}
/** Le plafond est inclus : un revenu égal au plafond bleu reste bleu. */
export function couleur(rfr: number, personnes: number, idf: boolean): Couleur {
  const p = plafondsRfr(personnes, idf);
  if (rfr <= p.bleu) return 'bleu';
  if (rfr <= p.jaune) return 'jaune';
  if (rfr <= p.violet) return 'violet';
  return 'rose';
}

/* ---------- Climat, besoin, puissance ---------- */
export const G = P.climat.g_hypothese as Record<Iso, number>;
/** Besoin de chauffage utile (kWh/an) = G × volume × DJU × 24 / 1000. */
export function besoinChauffage(surface: number, iso: Iso, dju: number, hauteur = P.climat.hauteur_sous_plafond_hypothese): number {
  return (G[iso] * surface * hauteur * dju * 24) / 1000;
}
/** Puissance demandée (kW) pendant les 3 jours les plus froids d'un hiver typique : GV × (19 − T). */
export function puissanceFroid(surface: number, iso: Iso, tFroid: number, hauteur = P.climat.hauteur_sous_plafond_hypothese): number {
  return (G[iso] * surface * hauteur * (P.climat.temperature_interieure_hypothese - tFroid)) / 1000;
}

/* ---------- Énergie ---------- */
export const prixFioulKwh = (eur1000l = P.energie.fioul.eur_1000l_ttc) => eur1000l / 1000 / P.energie.fioul.kwh_par_litre_hypothese;
export function prixKwh(e: Energie): number {
  if (e === 'elec') return P.energie.electricite.kwh_ttc;
  if (e === 'gaz') return P.energie.gaz.kwh_ttc;
  return prixFioulKwh();
}
export const rendementDefaut = (e: Energie) => (e === 'elec' ? P.rendements.radiateur_electrique : P.rendements.chaudiere_hypothese);
export function scopDefaut(t: TypePac): number {
  if (t === 'geo') return P.rendements.scop.geo;
  if (t === 'air_air') return P.rendements.scop.air_air_hypothese;
  return P.rendements.scop.air_eau;
}

/* ---------- Aides ---------- */
export function forfaitMpr(t: TypePac, c: Couleur): number {
  return (P.maprimerenov.forfaits[t] as Record<Couleur, number>)[c];
}
export const plafondDepense = (t: TypePac) => P.maprimerenov.forfaits[t].plafond_depense;

const facteurSurface = (table: Array<Array<number | null>>, s: number) => {
  for (const [lim, f] of table) if (lim === null || s < (lim as number)) return f as number;
  return 1;
};
export interface CeeIn { type: TypePac; logement: Logement; surface: number; zone: Zone; etasHaut: boolean; coupDePouce: boolean; couleur: Couleur; prixMwh?: number }
export interface CeeOut { kwhc: number; eur: number; prixMwh: number; precarite: boolean; chiffre: boolean }
/** Volume CEE en kWh cumac et sa valeur au prix moyen du registre Emmy. Air/air (BAR-TH-129) : non chiffré. */
export function cee(x: CeeIn): CeeOut {
  const precarite = x.couleur === 'bleu' || x.couleur === 'jaune';
  const prixMwh = x.prixMwh ?? (precarite ? P.cee.prix_mwh.precarite : P.cee.prix_mwh.classique);
  let base: { etas_bas: number; etas_haut: number; surface: Array<Array<number | null>> } | null = null;
  if (x.type === 'air_eau') base = x.logement === 'maison' ? P.cee.bar_th_171.maison : P.cee.bar_th_171.appartement;
  if (x.type === 'geo' && x.logement === 'maison') base = P.cee.bar_th_172.maison;
  if (!base) return { kwhc: 0, eur: 0, prixMwh, precarite, chiffre: false };
  const kwhc = (x.etasHaut ? base.etas_haut : base.etas_bas) * facteurSurface(base.surface, x.surface) * P.cee.zone[x.zone] * (x.coupDePouce ? P.cee.coup_de_pouce.coefficient : 1);
  return { kwhc: Math.round(kwhc), eur: Math.round((kwhc / 1000) * prixMwh), prixMwh, precarite, chiffre: true };
}

/**
 * Écrêtement (décret 2020-26, art. 3 IV) : MaPrimeRénov' + CEE + autres aides ≤ (1 − reste à charge minimal)
 * × dépense éligible TTC (dans la limite du plafond de dépense). C'est la prime MaPrimeRénov' qui baisse.
 */
export function ecreter(forfait: number, ceeEur: number, ttc: number, plafondDep: number, c: Couleur, autres = 0): { mpr: number; ecrete: number; maxAides: number } {
  const eligible = Math.min(ttc, plafondDep);
  const maxAides = eligible * (1 - P.ecretement.reste_a_charge_min[c]);
  const mpr = Math.max(0, Math.min(forfait, Math.floor(maxAides - ceeEur - autres)));
  return { mpr, ecrete: forfait - mpr, maxAides: Math.round(maxAides) };
}

export function prixDefaut(t: TypePac): number {
  if (t === 'air_eau') return P.prix_installation.air_eau.median_ttc;
  if (t === 'air_air') return P.prix_installation.air_air.median_ttc;
  return P.prix_installation.geo.depart_ttc;
}

/* ---------- Simulation complète ---------- */
export interface SimIn {
  dep: string;
  /** DJU d'une station choisie ; sinon celui du département. */
  dju?: number;
  surface: number;
  iso: Iso;
  /** Consommation connue (kWh/an d'énergie achetée) : remplace l'estimation par les DJU. */
  consoConnue?: number;
  energie: Energie;
  rendement?: number;
  type: TypePac;
  scop?: number;
  logement: Logement;
  personnes: number;
  rfr: number;
  /** Résidence principale : condition de MaPrimeRénov' (propriétaire occupant) et du Coup de pouce. */
  residencePrincipale: boolean;
  /** Logement de plus de 2 ans. */
  plus2ans: boolean;
  etasHaut: boolean;
  /** Modèle agréé (décret 2026-413), condition du Coup de pouce depuis le 1er septembre 2026. */
  agree: boolean;
  prixTtc?: number;
  prixKwhAvant?: number;
  prixKwhElec?: number;
}
export interface SimOut {
  dep: Dep; dju: number; couleur: Couleur; besoin: number; puissance: number;
  consoAvant: number; coutAvant: number; consoPac: number; coutPac: number; economie: number;
  prixTtc: number; forfait: number; mpr: number; ecrete: number; cee: CeeOut; aides: number; resteACharge: number;
  retourAns: number | null; eligibleMpr: boolean; coupDePouce: boolean; scop: number; rendement: number;
}
export function simuler(x: SimIn): SimOut {
  const dep = depByCode(x.dep);
  const dju = x.dju ?? dep.dju;
  const rendement = x.rendement ?? rendementDefaut(x.energie);
  const scop = x.scop ?? scopDefaut(x.type);
  const besoin = x.consoConnue && x.consoConnue > 0 ? x.consoConnue * rendement : besoinChauffage(x.surface, x.iso, dju);
  const consoAvant = besoin / rendement;
  const pAvant = x.prixKwhAvant ?? prixKwh(x.energie);
  const pElec = x.prixKwhElec ?? P.energie.electricite.kwh_ttc;
  const coutAvant = consoAvant * pAvant;
  const consoPac = besoin / scop;
  const coutPac = consoPac * pElec;
  const economie = coutAvant - coutPac;
  const c = couleur(x.rfr, x.personnes, dep.idf);
  const prixTtc = x.prixTtc && x.prixTtc > 0 ? x.prixTtc : prixDefaut(x.type);
  const eligibleMpr = x.residencePrincipale && x.plus2ans && x.type !== 'air_air';
  const forfait = eligibleMpr ? forfaitMpr(x.type, c) : 0;
  const coupDePouce = x.residencePrincipale && x.energie !== 'elec' && x.agree;
  const ce = cee({ type: x.type, logement: x.logement, surface: x.surface, zone: dep.zone, etasHaut: x.etasHaut, coupDePouce, couleur: c });
  const plaf = plafondDepense(x.type) || prixTtc;
  const e = ecreter(forfait, ce.eur, prixTtc, plaf, c);
  const aides = e.mpr + ce.eur;
  const resteACharge = Math.max(0, prixTtc - aides);
  const retourAns = economie > 0 ? resteACharge / economie : null;
  const puissance = puissanceFroid(x.surface, x.iso, dep.tbase);
  return { dep, dju, couleur: c, besoin, puissance, consoAvant, coutAvant, consoPac, coutPac, economie, prixTtc, forfait, mpr: e.mpr, ecrete: e.ecrete, cee: ce, aides, resteACharge, retourAns, eligibleMpr, coupDePouce, scop, rendement };
}

/** Valeurs de départ des simulateurs : une maison de 100 m² à isolation moyenne, chaudière gaz, PAC air/eau. */
export const DEFAUT: SimIn = {
  dep: '69', surface: 100, iso: 'moyenne', energie: 'gaz', type: 'air_eau', logement: 'maison', personnes: 3, rfr: 40000,
  residencePrincipale: true, plus2ans: true, etasHaut: false, agree: true,
};

/** Départements triés par DJU (du plus doux au plus froid). */
export const parDju = () => [...DEPARTEMENTS].sort((a, b) => a.dju - b.dju || a.code.localeCompare(b.code));

/* ---------- Petits calculs des mini-simulateurs ---------- */
/** Temps de retour en années (null si aucune économie). */
export const retour = (resteACharge: number, economieAn: number): number | null => (economieAn > 0 ? resteACharge / economieAn : null);
/** Éco-PTZ : mensualité d'un prêt à taux zéro (montant plafonné selon le nombre d'actions). */
export function ecoPtz(montant: number, annees: number, actions: 1 | 2 | 3): { pret: number; mensualite: number; plafond: number } {
  const E = P.eco_ptz;
  const plafond = actions >= 3 ? E.trois_actions : actions === 2 ? E.deux_actions : E.une_action;
  const pret = Math.min(montant, plafond);
  const n = Math.max(1, Math.min(E.duree_max_ans, Math.round(annees))) * 12;
  return { pret, mensualite: pret / n, plafond };
}
/** TVA : prix TTC d'une PAC (5,5 %) et d'une chaudière fossile (20 %) pour un même prix hors taxes. */
export const ttc = (ht: number, taux: number) => ht * (1 + taux);
/** MaPrimeRénov' rénovation d'ampleur : taux × min(HT, plafond), plafond selon le gain de classes. */
export function ampleur(ht: number, c: Couleur, classes: number): { aide: number; plafond: number; taux: number } {
  const A = P.maprimerenov.ampleur;
  const plafond = classes >= 3 ? A.plafond_3_classes : A.plafond_2_classes;
  const taux = A.taux_ht[c];
  return { aide: Math.round(taux * Math.min(ht, plafond)), plafond, taux };
}
/** Prix d'après le prix médian au kW des devis publiés (estimation). */
export function prixParKw(kw: number, t: 'air_air' | 'air_eau'): { median: number; bas?: number; haut?: number } {
  const o = P.prix_installation[t] as { eur_par_kw: number; eur_par_kw_p10?: number; eur_par_kw_p90?: number };
  return { median: kw * o.eur_par_kw, bas: o.eur_par_kw_p10 ? kw * o.eur_par_kw_p10 : undefined, haut: o.eur_par_kw_p90 ? kw * o.eur_par_kw_p90 : undefined };
}
/** Fioul : litres par an → kWh, à raison de l'hypothèse de 10 kWh par litre. */
export const litresEnKwh = (l: number) => l * P.energie.fioul.kwh_par_litre_hypothese;
