/** Catégorie de revenus Anah (bleu, jaune, violet, rose) à partir du revenu fiscal de référence. */
import { T, eur, type L } from './_kit';
import { ouiNon, nomCouleur } from './_pac';
import { couleur, plafondsRfr } from '../engine/pac';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Quelle est ma couleur MaPrimeRénov’ ?', 'Which MaPrimeRénov’ colour am I?'),
  cta: T(l, 'Voir les aides pour ma pompe à chaleur', 'See the grants for my heat pump'),
  inputs: [
    { id: 'r', label: T(l, 'Revenu fiscal de référence', 'Reference tax income'), def: 32000, unit: '€', max: 500000 },
    { id: 'p', label: T(l, 'Personnes au foyer', 'People in household'), def: 2, max: 12 },
    { id: 'i', label: T(l, 'En Île-de-France', 'In Île-de-France'), def: 0, options: ouiNon(l) },
  ],
  run: (v) => {
    const idf = v.i === 1, p = Math.max(1, v.p || 1), c = couleur(v.r, p, idf), pl = plafondsRfr(p, idf);
    return {
      head: [T(l, 'Votre catégorie', 'Your category'), nomCouleur(c, l)],
      rows: [
        [T(l, 'Plafond bleu', 'Blue ceiling'), eur(pl.bleu, l)],
        [T(l, 'Plafond jaune', 'Yellow ceiling'), eur(pl.jaune, l)],
        [T(l, 'Plafond violet', 'Purple ceiling'), eur(pl.violet, l)],
      ],
      note: T(l, 'Barème 2026 de l’Anah, revenu de l’avis d’impôt 2026 (revenus 2025).', '2026 Anah scale, income from the 2026 tax notice (2025 income).'),
    };
  },
});
