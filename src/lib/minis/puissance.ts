/** Puissance de chauffage demandée par les trois jours les plus froids d'un hiver typique du département. */
import { T, num, type L } from './_kit';
import { depOptions, depAt, depIndex, ISOS, isoOptions } from './_pac';
import { puissanceFroid, prixParKw } from '../engine/pac';
import { formatDecimal, formatMoney } from '../format';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Quelle puissance pour ma pompe à chaleur ?', 'What heat pump output do I need?'),
  cta: T(l, 'Ajouter le prix et les aides', 'Add the price and grants'),
  inputs: [
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('67'), options: depOptions() },
    { id: 's', label: T(l, 'Surface chauffée', 'Heated area'), def: 120, unit: 'm²', max: 600 },
    { id: 'i', label: T(l, 'Isolation', 'Insulation'), def: 1, options: isoOptions(l) },
  ],
  run: (v) => {
    const d = depAt(v.d), kw = puissanceFroid(v.s, ISOS[v.i] ?? 'moyenne', d.tbase), p = prixParKw(kw, 'air_eau');
    return {
      head: [T(l, 'Puissance demandée au froid', 'Output needed in cold spells'), `${formatDecimal(Math.round(kw * 10) / 10, 1, l)} kW`],
      rows: [
        [T(l, `3 jours les plus froids (${d.tbaseStation})`, `3 coldest days (${d.tbaseStation})`), `${formatDecimal(d.tbase, 1, l)} °C`],
        [T(l, 'Volume chauffé', 'Heated volume'), `${num(v.s * P.climat.hauteur_sous_plafond_estimation, l)} m³`],
        [T(l, 'Ordre de prix air/eau (médiane au kW)', 'Air-to-water price guide (median per kW)'), formatMoney(p.median, 0, l)],
      ],
      note: T(l, `Estimation : hauteur sous plafond supposée de ${formatDecimal(P.climat.hauteur_sous_plafond_estimation, 1, l)} m, coefficient d’isolation du site, consigne de 19 °C ; l’installateur dimensionne avec la température de base de la norme, plus basse.`, `Estimate: assumed ceiling height ${formatDecimal(P.climat.hauteur_sous_plafond_estimation, 1, l)} m, the site’s insulation coefficient, 19 °C set point; the installer sizes with the standard design temperature, which is lower.`),
    };
  },
});
