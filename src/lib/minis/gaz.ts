/** PAC air/eau ou chaudière gaz neuve : facture annuelle de chacune pour le même logement. */
import { T, eur, num, type L } from './_kit';
import { depOptions, depAt, depIndex, ISOS, isoOptions } from './_pac';
import { besoinChauffage, scopDefaut } from '../engine/pac';
import { P } from '../engine/params';
import { formatDecimal } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'PAC ou chaudière gaz : la facture de chacune', 'Heat pump or gas boiler: the bill for each'),
  cta: T(l, 'Ajouter le prix et les aides de la PAC', 'Add the heat pump’s price and grants'),
  inputs: [
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('44'), options: depOptions() },
    { id: 's', label: T(l, 'Surface chauffée', 'Heated area'), def: 100, unit: 'm²', max: 600 },
    { id: 'i', label: T(l, 'Isolation', 'Insulation'), def: 2, options: isoOptions(l) },
  ],
  run: (v) => {
    const d = depAt(v.d), b = besoinChauffage(v.s, ISOS[v.i] ?? 'bonne', d.dju);
    const gaz = (b / P.rendements.chaudiere_defaut) * P.energie.gaz.kwh_ttc, pac = (b / scopDefaut('air_eau')) * P.energie.electricite.kwh_ttc;
    return {
      head: [T(l, 'Écart par an en faveur de la PAC', 'Yearly gap in favour of the heat pump'), eur(gaz - pac, l)],
      rows: [
        [T(l, `Chaudière gaz neuve (${formatDecimal(P.rendements.chaudiere_defaut * 100, 0, l)} %)`, `New gas boiler (${formatDecimal(P.rendements.chaudiere_defaut * 100, 0, l)}%)`), eur(gaz, l)],
        [T(l, `PAC air/eau (SCOP ${formatDecimal(scopDefaut('air_eau'), 1, l)})`, `Air-to-water heat pump (SCOP ${formatDecimal(scopDefaut('air_eau'), 1, l)})`), eur(pac, l)],
        [T(l, 'Chaleur nécessaire', 'Heat needed'), `${num(b, l)} kWh`],
      ],
      note: T(l, 'Estimation : besoin calculé avec le coefficient d’isolation du site. Abonnement gaz non compté : le supprimer creuse l’écart.', 'Estimate: need worked out with the site’s insulation coefficient. Gas standing charge not counted: dropping it widens the gap.'),
    };
  },
});
