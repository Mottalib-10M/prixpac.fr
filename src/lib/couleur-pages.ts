/** Tableau partagé des pages MaPrimeRénov’ par couleur : aides et reste à charge pour quelques devis, calculés par le moteur. */
import type { Helpers } from './guide-types';

export function tableCouleur(h: Helpers, rfr: number, opts: { energie?: 'gaz' | 'fioul' | 'elec' } = {}): string {
  const fr = h.lang === 'fr';
  const cas: Array<['air_eau' | 'geo', number]> = [['air_eau', 10000], ['air_eau', h.P.prix_installation.air_eau.median_ttc], ['geo', 18000], ['geo', 24000]];
  const rows = cas.map(([type, devis]) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, type, rfr, prixTtc: devis, energie: opts.energie ?? 'gaz' });
    return [`${type === 'geo' ? (fr ? 'Géothermique' : 'Ground-source') : (fr ? 'Air/eau' : 'Air-to-water')}, ${h.eur(devis)}`, h.eur(r.mpr), h.eur(r.cee.eur), h.eur(r.aides), h.eur(r.resteACharge)];
  });
  const en = opts.energie === 'fioul' ? (fr ? 'chaudière fioul' : 'oil boiler') : opts.energie === 'elec' ? (fr ? 'radiateurs électriques' : 'electric heaters') : (fr ? 'chaudière gaz' : 'gas boiler');
  return h.table(fr ? ['PAC et devis TTC', 'MaPrimeRénov’', 'Prime CEE', 'Total des aides', 'Reste à charge'] : ['Heat pump and quote', 'MaPrimeRénov’', 'CEE bonus', 'Total grants', 'Out of pocket'], rows,
    fr ? `Calcul du site : maison de 100 m² dans le Rhône (zone H1), ${en} remplacée, foyer de 3 personnes, revenu fiscal de ${h.eur(rfr)}, écrêtement appliqué ; devis hypothétiques sauf la médiane air/eau publiée`
       : `Site calculation: 100 m² house in the Rhône (zone H1), ${en} replaced, 3-person household, reference tax income ${h.eur(rfr)}, cap applied; hypothetical quotes except the published air-to-water median`, ['l', 'r', 'r', 'r', 'r']);
}
