/** Temps de retour d'une PAC : reste à charge ÷ économie annuelle. */
import { T, eur, type L } from './_kit';
import { retour } from '../engine/pac';
import { formatDecimal } from '../format';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'En combien d’années ma PAC est-elle remboursée ?', 'How many years until my heat pump pays for itself?'),
  cta: T(l, 'Calculer le reste à charge et l’économie', 'Work out the out-of-pocket cost and saving'),
  inputs: [
    { id: 'r', label: T(l, 'Reste à charge, aides déduites', 'Out-of-pocket cost after grants'), def: 8500, unit: '€', max: 100000 },
    { id: 'e', label: T(l, 'Économie de chauffage par an', 'Heating saving per year'), def: 1200, unit: '€', max: 20000 },
  ],
  run: (v) => {
    const a = retour(v.r, v.e), n = P.cee.bar_th_171.duree_vie_ans;
    return {
      head: [T(l, 'Temps de retour', 'Payback time'), a === null ? T(l, 'jamais', 'never') : `${formatDecimal(Math.round(a * 10) / 10, 1, l)} ${T(l, 'ans', 'years')}`],
      rows: [
        [T(l, `Économie sur ${n} ans (durée de vie de la fiche CEE)`, `Saving over ${n} years (CEE sheet lifetime)`), eur(v.e * n, l)],
        [T(l, `Gain net sur ${n} ans`, `Net gain over ${n} years`), eur(v.e * n - v.r, l)],
      ],
      note: T(l, `Estimation : prix de l’énergie constants, entretien non compté ; ${n} ans = durée de vie conventionnelle de la fiche CEE BAR-TH-171.`, `Estimate: energy prices held constant, servicing not counted; ${n} years = conventional lifetime in CEE sheet BAR-TH-171.`),
    };
  },
});
