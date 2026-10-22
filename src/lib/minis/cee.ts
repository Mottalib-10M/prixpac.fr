/** Prime CEE d'une PAC air/eau en kWh cumac (fiche BAR-TH-171) et sa valeur au prix du registre Emmy. */
import { T, eur, num, type L } from './_kit';
import { COULEURS, couleurOptions, ouiNon } from './_pac';
import { cee, type Zone } from '../engine/pac';
import { formatDecimal } from '../format';
import type { MiniSpec } from '../mini-types';

const ZONES: Zone[] = ['H1', 'H2', 'H3'];
export default (l: L): MiniSpec => ({
  title: T(l, 'Ma prime CEE en kWh cumac et en euros', 'My CEE bonus in kWh cumac and euros'),
  cta: T(l, 'Ajouter MaPrimeRénov’ et le reste à charge', 'Add MaPrimeRénov’ and the out-of-pocket cost'),
  inputs: [
    { id: 's', label: T(l, 'Surface chauffée (maison)', 'Heated area (house)'), def: 100, unit: 'm²', max: 600 },
    { id: 'z', label: T(l, 'Zone climatique', 'Climate zone'), def: 1, options: ZONES.map((z, i) => ({ value: String(i), label: z })) },
    { id: 'k', label: T(l, 'Remplace une chaudière fioul ou gaz', 'Replaces an oil or gas boiler'), def: 1, options: ouiNon(l) },
    { id: 'c', label: T(l, 'Catégorie de revenus', 'Income category'), def: 2, options: couleurOptions(l) },
  ],
  run: (v) => {
    const r = cee({ type: 'air_eau', logement: 'maison', surface: v.s, zone: ZONES[v.z] ?? 'H2', etasHaut: false, coupDePouce: v.k === 1, couleur: COULEURS[v.c] ?? 'violet' });
    return {
      head: [T(l, 'Valeur de marché de la prime', 'Market value of the bonus'), eur(r.eur, l)],
      rows: [
        [T(l, 'Volume', 'Volume'), `${num(r.kwhc, l)} kWh cumac`],
        [T(l, 'Prix moyen Emmy', 'Emmy average price'), `${formatDecimal(r.prixMwh, 2, l)} €/MWh`],
        [T(l, 'Coup de pouce (× 5)', 'Coup de pouce (× 5)'), v.k === 1 ? T(l, 'oui', 'yes') : T(l, 'non', 'no')],
      ],
      note: T(l, 'Etas de 111 à 140 %. Le montant réel est celui que l’entreprise écrit avant signature.', 'Etas 111 to 140%. The real amount is the one the firm writes down before you sign.'),
    };
  },
});
