/** TVA à 5,5 % sur une PAC contre 20 % sur une chaudière fossile, pour un même prix hors taxes. */
import { T, eur, type L } from './_kit';
import { ttc } from '../engine/pac';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Combien me fait gagner la TVA à 5,5 % ?', 'How much does 5.5% VAT save me?'),
  cta: T(l, 'Ajouter les aides', 'Add the grants'),
  inputs: [{ id: 'h', label: T(l, 'Prix hors taxes du devis', 'Quote excluding VAT'), def: 12000, unit: '€', max: 100000 }],
  run: (v) => ({
    head: [T(l, 'Prix TTC d’une PAC', 'Heat pump price incl. VAT'), eur(ttc(v.h, P.tva.pac), l)],
    rows: [
      [T(l, 'TVA à 5,5 %', 'VAT at 5.5%'), eur(v.h * P.tva.pac, l)],
      [T(l, 'Même montant à 20 % (chaudière fioul ou gaz)', 'Same amount at 20% (oil or gas boiler)'), eur(ttc(v.h, P.tva.chaudiere_fossile), l)],
      [T(l, 'Écart', 'Difference'), eur(v.h * (P.tva.chaudiere_fossile - P.tva.pac), l)],
    ],
    note: T(l, 'Logement achevé depuis plus de 2 ans, pose par une entreprise.', 'Home completed over 2 years ago, fitted by a firm.'),
  }),
});
