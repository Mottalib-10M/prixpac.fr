/** Tableaux partagés des pages territoriales : climat, consommation, économie et prime CEE par département (moteur du site). */
import type { Helpers } from './guide-types';

export function tableRegion(h: Helpers, codes: string[]): string {
  const fr = h.lang === 'fr';
  const rows = [...codes].sort((a, b) => h.dep(a).dju - h.dep(b).dju).map((c) => {
    const d = h.dep(c), r = h.M.simuler({ ...h.M.DEFAUT, dep: c, rfr: 50000 });
    return [`${d.nom} (${d.code})`, `${d.station}${d.emprunt ? '*' : ''}`, h.num(d.dju), d.zone, `${h.num(r.consoPac)} kWh`, h.eur(r.economie), h.eur(r.cee.eur)];
  });
  return h.table(fr ? ['Département', 'Station', 'DJU', 'Zone', 'Électricité PAC', 'Économie / an', 'Prime CEE'] : ['Département', 'Station', 'HDD', 'Zone', 'Heat pump electricity', 'Saving / yr', 'CEE bonus'], rows,
    fr ? `Maison de 100 m² à isolation moyenne, chaudière gaz remplacée par une PAC air/eau ; DJU 2015-2024 Météo-France ; prime CEE avec Coup de pouce au prix classique Emmy de ${h.moisCee} ; * station d’un département voisin`
       : `100 m² averagely insulated house, gas boiler replaced by an air-to-water heat pump; HDD 2015-2024 Météo-France; CEE bonus with Coup de pouce at the ${h.moisCee} Emmy standard price; * station in a neighbouring département`, ['l', 'l', 'r', 'l', 'r', 'r', 'r']);
}
