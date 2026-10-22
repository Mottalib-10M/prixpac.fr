/** MaPrimeRénov' par geste pour une PAC, après écrêtement par la prime CEE. */
import { T, eur, type L } from './_kit';
import { COULEURS, couleurOptions, TYPES, typeOptions, nomCouleur } from './_pac';
import { forfaitMpr, ecreter, plafondDepense } from '../engine/pac';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Combien de MaPrimeRénov’ pour ma PAC ?', 'How much MaPrimeRénov’ for my heat pump?'),
  cta: T(l, 'Calculer avec mon département et mes revenus', 'Calculate with my département and income'),
  inputs: [
    { id: 't', label: T(l, 'Pompe à chaleur', 'Heat pump'), def: 0, options: typeOptions(l, ['air_eau', 'geo']) },
    { id: 'c', label: T(l, 'Catégorie de revenus', 'Income category'), def: 1, options: couleurOptions(l) },
    { id: 'x', label: T(l, 'Prix TTC du devis', 'Quote incl. VAT'), def: 15000, unit: '€', max: 100000 },
    { id: 'e', label: T(l, 'Prime CEE écrite sur le devis', 'CEE bonus on the quote'), def: 4000, unit: '€', max: 30000 },
  ],
  run: (v) => {
    const t = TYPES[v.t] ?? 'air_eau', c = COULEURS[v.c] ?? 'jaune', f = forfaitMpr(t, c), e = ecreter(f, v.e, v.x, plafondDepense(t), c);
    return {
      head: [T(l, 'MaPrimeRénov’ versée', 'MaPrimeRénov’ paid'), eur(e.mpr, l)],
      rows: [
        [T(l, `Forfait ${nomCouleur(c, l)}`, `${nomCouleur(c, l)} flat rate`), eur(f, l)],
        [T(l, 'Aides maximales (écrêtement)', 'Maximum grants (cap)'), eur(e.maxAides, l)],
        [T(l, 'Retiré par l’écrêtement', 'Removed by the cap'), eur(e.ecrete, l)],
        [T(l, 'Reste à charge', 'Out of pocket'), eur(Math.max(0, v.x - e.mpr - v.e), l)],
      ],
    };
  },
});
