/** Climat d'un département : degrés-jours Météo-France, zone climatique, station de référence. */
import { T, num, type L } from './_kit';
import { depOptions, depAt, depIndex } from './_pac';
import type { MiniSpec } from '../mini-types';
import { formatDecimal } from '../format';

export default (l: L): MiniSpec => ({
  title: T(l, 'Le climat de mon département', 'My département’s climate'),
  cta: T(l, 'Calculer ma PAC avec ce climat', 'Work out my heat pump with this climate'),
  inputs: [{ id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('35'), options: depOptions() }],
  run: (v) => {
    const d = depAt(v.d);
    return {
      head: [T(l, 'Degrés-jours par an (2015-2024)', 'Degree days per year (2015-2024)'), `${num(d.dju, l)} DJU`],
      rows: [
        [T(l, 'Année 2025', 'Year 2025'), d.dju2025 ? `${num(d.dju2025, l)} DJU` : '—'],
        [T(l, 'Zone climatique', 'Climate zone'), d.zone],
        [T(l, 'Station de référence', 'Reference station'), `${d.station} (${num(d.stationAlt, l)} m)`],
        [T(l, '3 jours les plus froids', '3 coldest days'), `${formatDecimal(d.tbase, 1, l)} °C`],
      ],
    };
  },
});
