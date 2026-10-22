/** Données communes aux mini-simulateurs (fichier ignoré par le registre : préfixe « _ »). */
import { DEPARTEMENTS, type Couleur, type TypePac, type Energie, type Iso } from '../engine/pac';
import type { L } from './_kit';
import { T } from './_kit';

/** Liste des départements pour un champ de choix : « 69 · Rhône ». La valeur est l'index (les champs sont numériques). */
export const depOptions = () => DEPARTEMENTS.map((d, i) => ({ value: String(i), label: `${d.code} · ${d.nom}` }));
export const depAt = (i: number) => DEPARTEMENTS[Math.max(0, Math.min(DEPARTEMENTS.length - 1, Math.round(i)))];
export const depIndex = (code: string) => Math.max(0, DEPARTEMENTS.findIndex((d) => d.code === code));

export const COULEURS: Couleur[] = ['bleu', 'jaune', 'violet', 'rose'];
export const couleurOptions = (l: L) => COULEURS.map((c, i) => ({ value: String(i), label: T(l, { bleu: 'Bleu (très modestes)', jaune: 'Jaune (modestes)', violet: 'Violet (intermédiaires)', rose: 'Rose (supérieurs)' }[c], { bleu: 'Blue (very low income)', jaune: 'Yellow (low income)', violet: 'Purple (middle income)', rose: 'Pink (higher income)' }[c]) }));
export const nomCouleur = (c: Couleur, l: L) => T(l, { bleu: 'bleu', jaune: 'jaune', violet: 'violet', rose: 'rose' }[c], { bleu: 'blue', jaune: 'yellow', violet: 'purple', rose: 'pink' }[c]);

export const TYPES: TypePac[] = ['air_eau', 'geo', 'air_air'];
export const typeOptions = (l: L, only: TypePac[] = TYPES) => only.map((t) => ({ value: String(TYPES.indexOf(t)), label: T(l, { air_eau: 'PAC air/eau', geo: 'PAC géothermique', air_air: 'PAC air/air' }[t], { air_eau: 'Air-to-water', geo: 'Ground-source', air_air: 'Air-to-air' }[t]) }));
export const ENERGIES: Energie[] = ['gaz', 'fioul', 'elec'];
export const energieOptions = (l: L) => ENERGIES.map((e, i) => ({ value: String(i), label: T(l, { gaz: 'Chaudière gaz', fioul: 'Chaudière fioul', elec: 'Radiateurs électriques' }[e], { gaz: 'Gas boiler', fioul: 'Oil boiler', elec: 'Electric heaters' }[e]) }));
export const ISOS: Iso[] = ['faible', 'moyenne', 'bonne', 'bbc'];
export const isoOptions = (l: L) => ISOS.map((e, i) => ({ value: String(i), label: T(l, { faible: 'Isolation faible', moyenne: 'Isolation moyenne', bonne: 'Bonne isolation', bbc: 'Très bonne (BBC)' }[e], { faible: 'Poor insulation', moyenne: 'Average insulation', bonne: 'Good insulation', bbc: 'Very good (low-energy)' }[e]) }));
export const ouiNon = (l: L) => [{ value: '1', label: T(l, 'Oui', 'Yes') }, { value: '0', label: T(l, 'Non', 'No') }];
