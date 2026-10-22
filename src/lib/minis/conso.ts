/** Consommation et coût annuels d'une PAC selon le climat du département. */
import { T, eur, num, type L } from './_kit';
import { depOptions, depAt, depIndex, ISOS, isoOptions, TYPES, typeOptions } from './_pac';
import { besoinChauffage, scopDefaut } from '../engine/pac';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Combien consomme une PAC chez moi ?', 'How much would a heat pump use in my home?'),
  cta: T(l, 'Comparer avec mon chauffage actuel', 'Compare with my current heating'),
  inputs: [
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('69'), options: depOptions() },
    { id: 's', label: T(l, 'Surface chauffée', 'Heated area'), def: 100, unit: 'm²', max: 600 },
    { id: 'i', label: T(l, 'Isolation', 'Insulation'), def: 1, options: isoOptions(l) },
    { id: 't', label: T(l, 'Pompe à chaleur', 'Heat pump'), def: 0, options: typeOptions(l) },
  ],
  run: (v) => {
    const d = depAt(v.d), t = TYPES[v.t] ?? 'air_eau', b = besoinChauffage(v.s, ISOS[v.i] ?? 'moyenne', d.dju), sc = scopDefaut(t), k = b / sc;
    return {
      head: [T(l, 'Électricité par an', 'Electricity per year'), `${num(k, l)} kWh`],
      rows: [
        [T(l, 'Coût au tarif bleu', 'Cost at the regulated tariff'), eur(k * P.energie.electricite.kwh_ttc, l)],
        [T(l, 'Chaleur fournie', 'Heat delivered'), `${num(b, l)} kWh`],
        [T(l, `Climat (${d.station})`, `Climate (${d.station})`), `${num(d.dju, l)} DJU`],
      ],
      note: T(l, `SCOP retenu ${String(sc).replace('.', ',')} (mesures ADEME). Chauffage seul, sans eau chaude.`, `SCOP used ${sc} (ADEME measurements). Space heating only, no hot water.`),
    };
  },
});
