import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Les dix départements les plus doux et les dix plus froids en DJU (données du site). */
const extremes = (h: Helpers) => {
  const fr = h.lang === 'fr', all = h.M.parDju();
  const doux = all.slice(0, 8), froids = all.slice(-8).reverse();
  const rows = doux.map((d, i) => { const f = froids[i]; return [`${d.nom} (${d.code})`, h.num(d.dju), d.zone, `${f.nom} (${f.code})`, h.num(f.dju), f.zone]; });
  return h.table(fr ? ['Les plus doux', 'DJU', 'Zone', 'Les plus froids', 'DJU', 'Zone'] : ['Mildest', 'HDD', 'Zone', 'Coldest', 'HDD', 'Zone'], rows,
    fr ? 'DJU base 18 °C, moyenne 2015-2024 à la station Météo-France la plus proche du chef-lieu (96 départements métropolitains)' : 'Heating degree-days base 18 °C, 2015-2024 average at the Météo-France station nearest the main town (96 mainland départements)', ['l', 'r', 'l', 'l', 'r', 'l']);
};

const recent = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = ['06', '13', '33', '35', '44', '69', '75', '59', '67', '63'].map((c) => {
    const d = h.dep(c);
    return [d.nom, h.num(d.dju), d.dju2025 === null ? '—' : h.num(d.dju2025), d.dju2025 === null ? '—' : h.pct(d.dju2025 / d.dju - 1, 0)];
  });
  return h.table(fr ? ['Département', 'Moyenne 2015-2024', 'Année 2025', 'Écart'] : ['Département', '2015-2024 average', 'Year 2025', 'Gap'], rows,
    fr ? 'DJU base 18 °C, Météo-France ; « — » : année 2025 incomplète à la station' : 'HDD base 18 °C, Météo-France; “—”: 2025 incomplete at the station', ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'climat-degres-jours-departement',
  group: 'territoires',
  order: 2,
  mini: 'dju',
  related: ['pompe-a-chaleur-par-departement', 'consommation-pompe-a-chaleur', 'puissance-pompe-a-chaleur', 'prime-cee-pompe-a-chaleur', 'pompe-a-chaleur-hauts-de-france'],
  sources: ['meteo', 'zones', 'geoApi'],
  fr: {
    slug: 'climat-degres-jours-departement',
    nav: 'Degrés-jours par département',
    card: 'DJU Météo-France 2015-2024 des 96 départements, zones H1, H2, H3.',
    title: 'Degrés-jours par département : DJU Météo-France 2015-2024',
    description: 'Degrés-jours unifiés (DJU) par département : moyenne Météo-France 2015-2024 et année 2025, zone H1, H2 ou H3, et leur effet sur votre pompe à chaleur.',
    h1: 'Degrés-jours et climat de chaque département',
    intro: 'Les degrés-jours mesurent combien il faut chauffer. Le site les a calculés pour chaque département à partir des relevés quotidiens de Météo-France.',
    resume: (h) => {
      const all = h.M.parDju(), a = all[0], z = all[all.length - 1];
      return `Le degré-jour unifié (DJU) est l’outil standard pour mesurer le besoin de chauffage d’un lieu. Pour chaque jour, on calcule l’écart entre 18 °C et la température moyenne extérieure, quand elle est plus basse ; on additionne sur l’année. Un lieu à 2 000 DJU demande environ deux fois plus de chauffage qu’un lieu à 1 000 DJU, pour la même maison. Le site a calculé ces DJU à partir des données quotidiennes publiées en open data par Météo-France, pour la station la plus proche de chaque chef-lieu, en moyenne sur les dix années 2015 à 2024, puis pour 2025 seule. Les écarts sont grands : ${h.num(a.dju)} DJU en ${a.nom} (${a.station}), ${h.num(z.dju)} en ${z.nom} (${z.station}). Ces chiffres alimentent toute la chaîne de calcul du site : la chaleur nécessaire, la consommation de la PAC, l’économie et le temps de retour. La zone climatique H1, H2 ou H3, qui fixe le facteur de la prime CEE, vient d’un autre texte, l’arrêté du 26 octobre 2010, et ne suit pas exactement les DJU.`;
    },
    faqs: (h) => [
      { q: 'Pourquoi une base de 18 °C et non 19 °C ?', a: 'La base de 18 °C est la convention française pour les DJU de chauffage : on considère que les apports gratuits (soleil, occupants, appareils) couvrent l’écart entre 18 °C dehors et 19 à 20 °C dedans. Les sites qui publient des DJU en base 17 °C ou 19 °C donnent des chiffres différents ; ceux du site sont tous en base 18 °C.' },
      { q: 'Ma commune est en altitude : les DJU du département conviennent-ils ?', a: 'Pas forcément. La station de référence est celle du chef-lieu, souvent en plaine. En montagne, chaque centaine de mètres en plus ajoute des degrés-jours. Dans le simulateur, ouvrez « Affiner » et choisissez une autre station du département, plus proche de chez vous en distance et en altitude.' },
      { q: 'Pourquoi la zone climatique ne suit-elle pas les DJU ?', a: 'Les zones H1, H2 et H3 datent de la réglementation thermique de 2010 et sont fixées par département, avec quelques ajustements. Elles servent aux CEE et à la réglementation. Les DJU mesurent le climat réel récent. Un département peut donc être en H2 avec plus de degrés-jours qu’un département en H1, comme les Alpes-de-Haute-Provence face à Paris.' },
    ],
    body: (h) => `<h2>Les départements les plus doux et les plus froids</h2>
${extremes(h)}
<p>Le classement complet des 96 départements, avec l’économie qu’une PAC y permet, est sur la page ${h.a('pompe-a-chaleur-par-departement', 'pompe à chaleur par département')}.</p>
<!--mini:dju-->
<h2>L’année 2025 par rapport à la moyenne</h2>
${recent(h)}
<p>Une année plus douce que la moyenne fait baisser la facture de chauffage, et donc l’économie apportée par une PAC. Le simulateur utilise la moyenne sur dix ans, plus représentative de la durée de vie d’un appareil.</p>
<h2>Comment le site calcule les DJU</h2>
<p>Pour chaque département, le site prend la station Météo-France la plus proche de la préfecture qui a des relevés complets, à partir des fichiers quotidiens publiés sur ${h.src('meteo', 'meteo.data.gouv.fr')}. Pour chaque jour, il fait la moyenne de la température minimale et maximale, puis l’écart à 18 °C quand il est positif, et additionne sur l’année civile. Les années avec trop de jours manquants sont écartées. Le détail est sur la page de méthode, et le script de calcul est publié avec le code du site.</p>
<h2>Les zones climatiques</h2>
<p>La zone H1 regroupe le Nord, l’Est, l’Île-de-France, le Centre et une partie du Massif central et des Alpes ; la zone H3 le littoral méditerranéen et la Corse ; la zone H2 tout le reste. Le facteur appliqué à la prime CEE est de ${h.num(h.P.cee.zone.H1, 1)} en H1, ${h.num(h.P.cee.zone.H2, 1)} en H2 et ${h.num(h.P.cee.zone.H3, 1)} en H3.</p>`,
  },
  en: {
    slug: 'heating-degree-days-france',
    nav: 'Degree-days by département',
    card: 'Météo-France 2015-2024 HDD for all 96 départements, zones H1, H2, H3.',
    title: 'Heating degree-days in France by département, 2015-2024',
    description: 'Heating degree-days (DJU) for each French département: Météo-France 2015-2024 average and 2025, climate zone H1, H2 or H3, and what they change for a heat pump.',
    h1: 'Degree-days and the climate of each département',
    intro: 'Degree-days measure how much heating is needed. The site worked them out for each département from Météo-France daily records.',
    resume: (h) => {
      const all = h.M.parDju(), a = all[0], z = all[all.length - 1];
      return `The heating degree-day (DJU in French) is the standard tool for measuring a place’s heating need. For each day, take the gap between 18 °C and the average outdoor temperature, when it is lower; add them up over the year. A place with 2,000 degree-days needs roughly twice as much heating as one with 1,000, for the same house. The site worked out these figures from the daily data published as open data by Météo-France, for the station nearest each département’s main town, averaged over the ten years 2015 to 2024, and then for 2025 alone. The gaps are wide: ${h.num(a.dju)} in ${a.nom} (${a.station}), ${h.num(z.dju)} in ${z.nom} (${z.station}). These figures feed the site’s whole chain of calculation: heat needed, heat pump consumption, saving and payback. The climate zone H1, H2 or H3, which sets the CEE bonus factor, comes from a different text, the order of 26 October 2010, and does not exactly follow degree-days.`;
    },
    faqs: (h) => [
      { q: 'Why a base of 18 °C rather than 19 °C?', a: 'The 18 °C base is the French convention for heating degree-days: free gains (sun, occupants, appliances) are assumed to cover the gap between 18 °C outside and 19 to 20 °C inside. Sites publishing degree-days at a 17 °C or 19 °C base give different figures; all of this site’s are at an 18 °C base.' },
      { q: 'My town is at altitude: do the département figures apply?', a: 'Not necessarily. The reference station is the main town’s, often in a valley. In the mountains, each extra hundred metres adds degree-days. In the calculator, open “Refine” and choose another station in the département, closer to you in distance and altitude.' },
      { q: 'Why does the climate zone not follow degree-days?', a: 'Zones H1, H2 and H3 date from the 2010 thermal regulation and are set by département, with a few adjustments. They are used for CEE and regulation. Degree-days measure the actual recent climate. A département can therefore be in H2 with more degree-days than one in H1, as with Alpes-de-Haute-Provence compared with Paris.' },
    ],
    body: (h) => `<h2>The mildest and coldest départements</h2>
${extremes(h)}
<p>The full ranking of all 96 départements, with the saving a heat pump brings there, is on the ${h.a('pompe-a-chaleur-par-departement', 'heat pump by département')} page.</p>
<!--mini:dju-->
<h2>2025 compared with the average</h2>
${recent(h)}
<p>A year milder than average lowers the heating bill, and so the saving a heat pump brings. The calculator uses the ten-year average, more representative of a unit’s lifetime.</p>
<h2>How the site calculates degree-days</h2>
<p>For each département, the site takes the Météo-France station nearest the prefecture with complete records, from the daily files published on ${h.src('meteo', 'meteo.data.gouv.fr')}. For each day it averages the minimum and maximum temperature, takes the gap to 18 °C when positive, and adds up over the calendar year. Years with too many missing days are discarded. Details are on the method page, and the calculation script is published with the site’s code.</p>
<h2>Climate zones</h2>
<p>Zone H1 covers the North, the East, Île-de-France, the Centre and part of the Massif Central and Alps; zone H3 the Mediterranean coast and Corsica; zone H2 everything else. The factor applied to the CEE bonus is ${h.num(h.P.cee.zone.H1, 1)} in H1, ${h.num(h.P.cee.zone.H2, 1)} in H2 and ${h.num(h.P.cee.zone.H3, 1)} in H3.</p>`,
  },
});
