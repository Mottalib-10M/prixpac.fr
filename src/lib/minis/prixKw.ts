/** Prix d'une PAC air/air d'après le prix au kW des devis publiés. */
import { T, eur, type L } from './_kit';
import { prixParKw } from '../engine/pac';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Prix d’une clim réversible selon la puissance', 'Reversible air-con price by output'),
  cta: T(l, 'Comparer avec une PAC air/eau', 'Compare with an air-to-water heat pump'),
  inputs: [{ id: 'k', label: T(l, 'Puissance totale des unités', 'Total output of the units'), def: 7, unit: 'kW', max: 40, decimals: 1 }],
  run: (v) => {
    const p = prixParKw(v.k, 'air_air');
    return {
      head: [T(l, 'Prix médian estimé', 'Estimated median price'), eur(p.median, l)],
      rows: [
        [T(l, '1 devis sur 10 sous', '1 quote in 10 below'), eur(p.bas ?? 0, l)],
        [T(l, '1 devis sur 10 au-dessus de', '1 quote in 10 above'), eur(p.haut ?? 0, l)],
      ],
      note: T(l, '148 devis air/air, observatoire ScoreSolaire (CC BY 4.0), août 2026.', '148 air-to-air quotes, ScoreSolaire observatory (CC BY 4.0), August 2026.'),
    };
  },
});
