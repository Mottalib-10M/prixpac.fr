/** Temps de retour d'une PAC : reste à charge ÷ économie annuelle. */
import { T, eur, type L } from './_kit';
import { retour } from '../engine/pac';
import { formatDecimal } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'En combien d’années ma PAC est-elle remboursée ?', 'How many years until my heat pump pays for itself?'),
  cta: T(l, 'Calculer le reste à charge et l’économie', 'Work out the out-of-pocket cost and saving'),
  inputs: [
    { id: 'r', label: T(l, 'Reste à charge, aides déduites', 'Out-of-pocket cost after grants'), def: 8500, unit: '€', max: 100000 },
    { id: 'e', label: T(l, 'Économie de chauffage par an', 'Heating saving per year'), def: 1200, unit: '€', max: 20000 },
  ],
  run: (v) => {
    const a = retour(v.r, v.e);
    return {
      head: [T(l, 'Temps de retour', 'Payback time'), a === null ? T(l, 'jamais', 'never') : `${formatDecimal(Math.round(a * 10) / 10, 1, l)} ${T(l, 'ans', 'years')}`],
      rows: [
        [T(l, 'Économie sur 17 ans (durée CEE)', 'Saving over 17 years (CEE life)'), eur(v.e * 17, l)],
        [T(l, 'Gain net sur 17 ans', 'Net gain over 17 years'), eur(v.e * 17 - v.r, l)],
      ],
      note: T(l, 'Prix de l’énergie constants ; entretien non compté.', 'Energy prices held constant; servicing not counted.'),
    };
  },
});
