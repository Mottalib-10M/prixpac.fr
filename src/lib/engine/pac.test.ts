import { describe, it, expect } from 'vitest';
import { P } from './params';
import * as M from './index';

describe('paramètres 2026 relus sur les sources', () => {
  it('forfaits MaPrimeRénov’ par geste (Service-Public F35083)', () => {
    expect(P.maprimerenov.forfaits.air_eau).toMatchObject({ bleu: 5000, jaune: 4000, violet: 3000, rose: 0, plafond_depense: 12000 });
    expect(P.maprimerenov.forfaits.geo).toMatchObject({ bleu: 11000, jaune: 9000, violet: 6000, rose: 0, plafond_depense: 18000 });
    expect(P.maprimerenov.anciennete_logement_ans_pac).toBe(2);
  });
  it('fiche BAR-TH-171 v. A82.5 et BAR-TH-172', () => {
    expect(P.cee.bar_th_171.maison.etas_bas).toBe(90900);
    expect(P.cee.bar_th_171.maison.etas_haut).toBe(109200);
    expect(P.cee.bar_th_171.appartement.etas_bas).toBe(48700);
    expect(P.cee.bar_th_172.maison.etas_haut).toBe(119400);
    expect(P.cee.zone).toEqual({ H1: 1.2, H2: 1, H3: 0.7 });
    expect(P.cee.coup_de_pouce.coefficient).toBe(5);
  });
  it('chaque clé « _source » renvoie à une source déclarée', () => {
    const keys = new Set(Object.keys(P.sources));
    const walk = (o: unknown): void => {
      if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k.startsWith('_') && k.endsWith('source')) expect(keys.has(v as string), `${k} → ${v}`).toBe(true); walk(v); }
    };
    walk(P);
  });
});

describe('catégorie de revenus', () => {
  it('plafond inclus, hors Île-de-France', () => {
    expect(M.couleur(17363, 1, false)).toBe('bleu');
    expect(M.couleur(17364, 1, false)).toBe('jaune');
    expect(M.couleur(22259, 1, false)).toBe('jaune');
    expect(M.couleur(31185, 1, false)).toBe('violet');
    expect(M.couleur(31186, 1, false)).toBe('rose');
  });
  it('personne en plus au-delà de 5', () => {
    expect(M.plafondsRfr(6, false).bleu).toBe(40835 + 5151);
    expect(M.plafondsRfr(7, true).violet).toBe(96817 + 2 * 12257);
  });
  it('Île-de-France plus haute', () => {
    expect(M.couleur(24031, 1, true)).toBe('bleu');
    expect(M.couleur(24031, 1, false)).toBe('violet');
  });
});

describe('prime CEE', () => {
  it('maison 100 m² en H2, Etas < 140 %, Coup de pouce, ménage violet', () => {
    const c = M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'violet' });
    expect(c.kwhc).toBe(90900 * 5);
    expect(c.precarite).toBe(false);
    expect(c.eur).toBe(Math.round(454.5 * P.cee.prix_mwh.classique));
  });
  it('facteurs de surface et de zone', () => {
    const f = (s: number, zone: M.Zone) => M.cee({ type: 'air_eau', logement: 'maison', surface: s, zone, etasHaut: true, coupDePouce: false, couleur: 'rose' }).kwhc;
    expect(f(69, 'H1')).toBe(Math.round(109200 * 0.5 * 1.2));
    expect(f(70, 'H3')).toBe(Math.round(109200 * 0.7 * 0.7));
    expect(f(90, 'H2')).toBe(109200);
  });
  it('appartement : seuils 35 et 60 m²', () => {
    const f = (s: number) => M.cee({ type: 'air_eau', logement: 'appartement', surface: s, zone: 'H2', etasHaut: false, coupDePouce: false, couleur: 'rose' }).kwhc;
    expect(f(34)).toBe(24350); expect(f(35)).toBe(34090); expect(f(60)).toBe(48700);
  });
  it('bleu et jaune : prix précarité', () => {
    expect(M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: false, couleur: 'jaune' }).prixMwh).toBe(P.cee.prix_mwh.precarite);
  });
  it('air/air et géothermie en appartement : non chiffrés', () => {
    expect(M.cee({ type: 'air_air', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'bleu' }).chiffre).toBe(false);
    expect(M.cee({ type: 'geo', logement: 'appartement', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'bleu' }).chiffre).toBe(false);
  });
});

describe('écrêtement (décret 2020-26)', () => {
  it('bleu : aides plafonnées à 90 % de la dépense éligible', () => {
    const e = M.ecreter(5000, 7000, 15000, 12000, 'bleu');
    expect(e.maxAides).toBe(10800);
    expect(e.mpr).toBe(3800);
    expect(e.ecrete).toBe(1200);
  });
  it('violet : 60 % ; rien n’est écrêté quand la marge suffit', () => {
    expect(M.ecreter(3000, 3000, 20000, 12000, 'violet').mpr).toBe(3000);
    expect(M.ecreter(3000, 6000, 10000, 12000, 'violet').mpr).toBe(0);
  });
  it('jamais négatif', () => {
    expect(M.ecreter(5000, 20000, 8000, 12000, 'bleu').mpr).toBe(0);
  });
});

describe('besoin, puissance, simulation', () => {
  it('besoin = G × volume × DJU × 24 / 1000', () => {
    expect(M.besoinChauffage(100, 'moyenne', 2000)).toBeCloseTo(1.1 * 250 * 2000 * 24 / 1000, 6);
  });
  it('96 départements de métropole, DJU plausibles', () => {
    expect(M.DEPARTEMENTS.length).toBe(96);
    for (const d of M.DEPARTEMENTS) {
      expect(d.dju).toBeGreaterThan(800); expect(d.dju).toBeLessThan(3200);
      expect(['H1', 'H2', 'H3']).toContain(d.zone);
      expect(d.tbase).toBeGreaterThan(-10); expect(d.tbase).toBeLessThan(10);
    }
    expect(M.depByCode('75').idf).toBe(true);
    expect(M.depByCode('13').zone).toBe('H3');
  });
  it('simulation par défaut cohérente', () => {
    const r = M.simuler(M.DEFAUT);
    expect(r.besoin).toBeGreaterThan(5000);
    expect(r.consoPac).toBeCloseTo(r.besoin / 2.9, 6);
    expect(r.economie).toBeCloseTo(r.coutAvant - r.coutPac, 6);
    expect(r.aides).toBe(r.mpr + r.cee.eur);
    expect(r.resteACharge).toBe(r.prixTtc - r.aides);
    expect(r.mpr + r.cee.eur).toBeLessThanOrEqual(Math.min(r.prixTtc, 12000) * (1 - P.ecretement.reste_a_charge_min[r.couleur]) + 1);
  });
  it('air/air : pas de MaPrimeRénov’ ; résidence secondaire : ni MPR ni Coup de pouce', () => {
    expect(M.simuler({ ...M.DEFAUT, type: 'air_air' }).mpr).toBe(0);
    const s = M.simuler({ ...M.DEFAUT, residencePrincipale: false });
    expect(s.mpr).toBe(0); expect(s.coupDePouce).toBe(false);
  });
  it('rose : aucune MaPrimeRénov’ en métropole', () => {
    expect(M.simuler({ ...M.DEFAUT, rfr: 200000 }).mpr).toBe(0);
  });
  it('consommation connue remplace l’estimation', () => {
    const r = M.simuler({ ...M.DEFAUT, consoConnue: 15000 });
    expect(r.consoAvant).toBeCloseTo(15000, 6);
  });
});

describe('constantes sourcées le 2026-10-22', () => {
  it('fioul : 10 kWh PCI par litre (Base Carbone, 3,25 ÷ 0,325)', () => {
    expect(P.energie.fioul.kwh_pci_par_litre).toBeCloseTo(3.25 / 0.325, 6);
  });
  it('méthode 3CL-DPE : consigne 19 °C, effet joule 1, SCOP air/air 3 / 3,3', () => {
    expect(P.climat.temperature_interieure).toBe(19);
    expect(P.rendements.radiateur_electrique).toBe(1);
    expect(P.rendements.scop.air_air).toMatchObject({ H1: 3, H2: 3, H3: 3.3 });
    expect(M.scopDefaut('air_air', 'H3')).toBe(3.3);
    expect(M.simuler({ ...M.DEFAUT, dep: '83', type: 'air_air', energie: 'elec' }).scop).toBe(P.rendements.scop.air_air[M.depByCode('83').zone]);
  });
  it('règlement 813/2013 : 86 % pour les chaudières neuves', () => {
    expect(P.rendements.chaudiere_defaut).toBe(0.86);
  });
  it('toute source citée a une adresse ; les estimations sont nommées comme telles', () => {
    for (const s of Object.values(P.sources)) expect(s.url).toMatch(/^https:\/\//);
    expect(Object.keys(P.climat).filter((k) => /hypothese/.test(k))).toEqual([]);
    expect(P.climat.g_estimation.moyenne).toBeGreaterThan(0);
  });
});
