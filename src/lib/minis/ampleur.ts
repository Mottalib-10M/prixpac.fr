/** MaPrimeRénov' rénovation d'ampleur : taux selon les revenus × dépense HT plafonnée. */
import { T, eur, type L } from './_kit';
import { COULEURS, couleurOptions } from './_pac';
import { ampleur } from '../engine/pac';
import { formatPercent } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Mon aide en rénovation d’ampleur', 'My whole-home renovation grant'),
  cta: T(l, 'Comparer avec une PAC seule', 'Compare with a heat pump alone'),
  inputs: [
    { id: 'h', label: T(l, 'Travaux hors taxes', 'Works excluding VAT'), def: 45000, unit: '€', max: 200000 },
    { id: 'c', label: T(l, 'Catégorie de revenus', 'Income category'), def: 1, options: couleurOptions(l) },
    { id: 'g', label: T(l, 'Gain de classes DPE', 'DPE classes gained'), def: 2, options: [{ value: '2', label: T(l, '2 classes', '2 classes') }, { value: '3', label: T(l, '3 classes ou plus', '3 classes or more') }] },
  ],
  run: (v) => {
    const r = ampleur(v.h, COULEURS[v.c] ?? 'jaune', v.g);
    return {
      head: [T(l, 'Aide estimée', 'Estimated grant'), eur(r.aide, l)],
      rows: [
        [T(l, 'Taux', 'Rate'), formatPercent(r.taux, 0, l)],
        [T(l, 'Dépense retenue au plus', 'Expense counted at most'), eur(r.plafond, l)],
      ],
      note: T(l, 'Barème 2026 ; accompagnateur Rénov’ obligatoire, écrêtement non compté.', '2026 scale; Mon Accompagnateur Rénov’ required, cap not counted.'),
    };
  },
});
