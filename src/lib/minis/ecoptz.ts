/** Éco-prêt à taux zéro : montant plafonné et mensualité. */
import { T, eur, type L } from './_kit';
import { ecoPtz } from '../engine/pac';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Ma mensualité d’éco-PTZ', 'My eco-loan monthly payment'),
  cta: T(l, 'Calculer le reste à charge à financer', 'Work out the cost left to finance'),
  inputs: [
    { id: 'm', label: T(l, 'Reste à charge à financer', 'Amount to finance'), def: 9000, unit: '€', max: 100000 },
    { id: 'a', label: T(l, 'Durée', 'Term'), def: 10, unit: T(l, 'ans', 'yrs'), max: 15 },
    { id: 'n', label: T(l, 'Nombre de travaux', 'Number of works'), def: 1, options: [{ value: '1', label: T(l, '1 action (PAC seule)', '1 action (heat pump only)') }, { value: '2', label: T(l, '2 actions', '2 actions') }, { value: '3', label: T(l, '3 actions ou plus', '3 or more actions') }] },
  ],
  run: (v) => {
    const r = ecoPtz(v.m, v.a, (Math.min(3, Math.max(1, v.n)) as 1 | 2 | 3));
    return {
      head: [T(l, 'Mensualité, intérêts 0 %', 'Monthly payment, 0% interest'), eur(r.mensualite, l)],
      rows: [
        [T(l, 'Montant prêté', 'Amount lent'), eur(r.pret, l)],
        [T(l, 'Plafond pour ce cas', 'Ceiling in this case'), eur(r.plafond, l)],
        [T(l, 'Reste à payer comptant', 'Left to pay in cash'), eur(Math.max(0, v.m - r.pret), l)],
      ],
    };
  },
});
