/** Économie annuelle d'une PAC air/eau face au chauffage actuel. */
import { T, eur, num, type L } from './_kit';
import { depOptions, depAt, depIndex, ENERGIES, energieOptions } from './_pac';
import { simuler, DEFAUT } from '../engine/pac';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Combien je gagne par an avec une PAC ?', 'How much would I save each year?'),
  cta: T(l, 'Ajouter le prix et les aides', 'Add the price and grants'),
  inputs: [
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('59'), options: depOptions() },
    { id: 'e', label: T(l, 'Chauffage actuel', 'Current heating'), def: 1, options: energieOptions(l) },
    { id: 's', label: T(l, 'Surface chauffée', 'Heated area'), def: 110, unit: 'm²', max: 600 },
  ],
  run: (v) => {
    const r = simuler({ ...DEFAUT, dep: depAt(v.d).code, energie: ENERGIES[v.e] ?? 'fioul', surface: v.s });
    return {
      head: [T(l, 'Économie par an', 'Saving per year'), eur(r.economie, l)],
      rows: [
        [T(l, 'Aujourd’hui', 'Today'), eur(r.coutAvant, l)],
        [T(l, 'Avec une PAC air/eau', 'With an air-to-water heat pump'), eur(r.coutPac, l)],
        [T(l, 'Besoin de chauffage', 'Heating need'), `${num(r.besoin, l)} kWh`],
      ],
      note: T(l, 'Isolation moyenne ; abonnements non comptés.', 'Average insulation; standing charges not counted.'),
    };
  },
});
