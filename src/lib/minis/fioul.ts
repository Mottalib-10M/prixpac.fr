/** Remplacer une chaudière fioul : litres par an → coût actuel, coût avec une PAC air/eau. */
import { T, eur, num, type L } from './_kit';
import { litresEnKwh, scopDefaut } from '../engine/pac';
import { P } from '../engine/params';
import { formatDecimal } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Ma cuve de fioul, convertie en PAC', 'My heating-oil tank, converted to a heat pump'),
  cta: T(l, 'Ajouter le prix, MaPrimeRénov’ et le Coup de pouce', 'Add the price, MaPrimeRénov’ and Coup de pouce'),
  inputs: [
    { id: 'l', label: T(l, 'Fioul acheté par an', 'Oil bought per year'), def: 1800, unit: 'L', max: 20000 },
    { id: 'p', label: T(l, 'Prix du litre', 'Price per litre'), def: Math.round(P.energie.fioul.eur_1000l_ttc / 10) / 100, unit: '€', max: 5, decimals: 2 },
  ],
  run: (v) => {
    const kwh = litresEnKwh(v.l), chaleur = kwh * P.rendements.chaudiere_hypothese, elec = chaleur / scopDefaut('air_eau'), cPac = elec * P.energie.electricite.kwh_ttc, cF = v.l * v.p;
    return {
      head: [T(l, 'Économie par an', 'Saving per year'), eur(cF - cPac, l)],
      rows: [
        [T(l, 'Fioul aujourd’hui', 'Oil today'), eur(cF, l)],
        [T(l, 'Électricité de la PAC', 'Heat pump electricity'), `${num(elec, l)} kWh · ${eur(cPac, l)}`],
        [T(l, 'Prix du kWh de fioul', 'Oil price per kWh'), `${formatDecimal(v.p / P.energie.fioul.kwh_par_litre_hypothese, 3, l)} €`],
      ],
      note: T(l, 'Estimation : 1 litre ≈ 10 kWh, rendement de chaudière 86 %, SCOP 2,9.', 'Estimate: 1 litre ≈ 10 kWh, boiler efficiency 86%, SCOP 2.9.'),
    };
  },
});
