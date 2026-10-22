import { defineGuide, type Helpers } from '../../lib/guide-types';
import { tableRegion } from '../../lib/region-pages';

const CODES = ['75', '77', '78', '91', '92', '93', '94', '95'];
const nc = (h: Helpers, c: string) => (h.lang === 'fr' ? c : ({ bleu: 'blue', jaune: 'yellow', violet: 'purple', rose: 'pink' } as Record<string, string>)[c]);

/** Plafonds de revenus franciliens face à ceux du reste de la France (barème Anah 2026 du moteur). */
const plafonds = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = [1, 2, 3, 4, 5].map((n) => {
    const i = h.M.plafondsRfr(n, true), a = h.M.plafondsRfr(n, false);
    return [h.num(n), h.eur(i.bleu), h.eur(a.bleu), h.eur(i.jaune), h.eur(a.jaune), h.eur(i.violet), h.eur(a.violet)];
  });
  return h.table(fr ? ['Personnes', 'Bleu IdF', 'Bleu ailleurs', 'Jaune IdF', 'Jaune ailleurs', 'Violet IdF', 'Violet ailleurs'] : ['People', 'Blue IdF', 'Blue elsewhere', 'Yellow IdF', 'Yellow elsewhere', 'Purple IdF', 'Purple elsewhere'], rows,
    fr ? 'Revenu fiscal de référence maximal de chaque couleur MaPrimeRénov’ en 2026 ; au-dessus du plafond violet, le ménage est rose' : 'Maximum reference tax income for each MaPrimeRénov’ colour in 2026; above the purple ceiling the household is pink', ['r', 'r', 'r', 'r', 'r', 'r', 'r']);
};

/** Même ménage, même projet : en Île-de-France et ailleurs. */
const exemple = (h: Helpers) => {
  const rfr = 45000, personnes = 3;
  const idf = h.M.simuler({ ...h.M.DEFAUT, dep: '77', rfr, personnes });
  const autre = h.M.simuler({ ...h.M.DEFAUT, dep: '60', rfr, personnes });
  return { rfr, personnes, idf, autre };
};

export default defineGuide({
  id: 'pompe-a-chaleur-ile-de-france',
  group: 'territoires',
  order: 3,
  tool: 'departements',
  region: 'Île-de-France',
  related: ['pompe-a-chaleur-par-departement', 'plafonds-revenus-maprimerenov', 'pompe-a-chaleur-appartement', 'maprimerenov-pompe-a-chaleur', 'pompe-a-chaleur-hauts-de-france'],
  sources: ['meteo', 'zones', 'spMpr', 'bar171', 'emmy', 'cre', 'eurostatGaz'],
  fr: {
    slug: 'pompe-a-chaleur-ile-de-france',
    nav: 'PAC en Île-de-France',
    card: 'Les 8 départements franciliens, leurs plafonds d’aides et leur climat.',
    title: 'Pompe à chaleur en Île-de-France : aides et économie 2026',
    description: 'Pompe à chaleur en Île-de-France : plafonds MaPrimeRénov’ franciliens, prime CEE, climat Météo-France et économie annuelle dans les 8 départements franciliens.',
    h1: 'Pompe à chaleur en Île-de-France : les 8 départements',
    intro: 'Le tableau est filtré sur l’Île-de-France : changez la surface, l’énergie ou l’isolation, ou choisissez une autre région.',
    resume: (h) => {
      const e = exemple(h), p = h.dep('75'), m = h.dep('95');
      return `L’Île-de-France est la seule région où MaPrimeRénov’ applique des plafonds de revenus à part, plus hauts de 30 à 40 % que dans le reste du pays. Un même ménage peut donc changer de couleur, et de forfait, en traversant la limite de la région. Exemple : un foyer de ${e.personnes} personnes avec ${h.eur(e.rfr)} de revenu fiscal de référence est ${nc(h, e.idf.couleur)} en Seine-et-Marne et ${nc(h, e.autre.couleur)} dans l’Oise, à quelques kilomètres ; pour une PAC air/eau, il touche ${h.eur(e.idf.aides)} d’aides au total dans le premier cas et ${h.eur(e.autre.aides)} dans le second. Les huit départements sont tous en zone climatique H1, ce qui donne le facteur de prime CEE le plus fort. Le climat, lui, varie : Paris profite de l’îlot de chaleur urbain avec ${h.num(p.dju)} degrés-jours à la station du Luxembourg, quand le Val-d’Oise en compte ${h.num(m.dju)} à Pontoise. Le tableau calcule pour chaque département la consommation de la PAC, l’économie et la prime, aux prix de l’énergie d’aujourd’hui.`;
    },
    faqs: (h) => [
      { q: 'Faut-il habiter en Île-de-France pour avoir les plafonds franciliens ?', a: 'Oui : c’est l’adresse du logement où sont faits les travaux qui compte, dans l’un des huit départements de la région. Un ménage qui vit en Île-de-France mais rénove une résidence principale dans l’Oise ou l’Eure relève des plafonds du reste de la France. Le simulateur applique la règle selon le département choisi.' },
      { q: 'Pourquoi Paris consomme-t-il moins que la grande couronne ?', a: `La ville garde la chaleur : béton, bitume, chauffage et circulation font gagner un à deux degrés en hiver. La station du Luxembourg relève ${h.num(h.dep('75').dju)} degrés-jours par an en moyenne, contre plus de 2 200 à Melun ou Pontoise. À maison égale, la PAC y produit donc moins de chaleur et l’économie annuelle est plus faible.` },
      { q: 'Une pompe à chaleur est-elle possible dans un immeuble parisien ?', a: 'Oui, mais elle demande l’accord de la copropriété dès que l’unité extérieure touche la façade, le toit ou une cour commune, et souvent un avis de l’architecte des Bâtiments de France en secteur protégé. La page sur la PAC en appartement détaille les cas et la prime CEE propre aux logements collectifs.' },
    ],
    body: (h) => {
      const e = exemple(h);
      return `<h2>Les huit départements, du plus doux au plus froid</h2>
${tableRegion(h, CODES)}
<p>Les écarts restent modérés : tous les départements franciliens sont en zone H1 et la prime CEE y est la même pour une maison donnée. Ce qui change, c’est la quantité de chauffage, donc l’économie. Le tableau interactif en haut de page refait le calcul avec votre surface, votre énergie et votre isolation.</p>
<h2>Des plafonds de revenus propres à la région</h2>
${plafonds(h)}
<p>Avec ${h.eur(e.rfr)} de revenu pour ${e.personnes} personnes, le ménage de l’exemple est ${nc(h, e.idf.couleur)} en Île-de-France : forfait de ${h.eur(e.idf.forfait)} pour une PAC air/eau et prime CEE de ${h.eur(e.idf.cee.eur)}, soit un reste à charge de ${h.eur(e.idf.resteACharge)} sur un devis de ${h.eur(e.idf.prixTtc)}. Dans l’Oise, il serait ${nc(h, e.autre.couleur)} : forfait de ${h.eur(e.autre.forfait)}, prime de ${h.eur(e.autre.cee.eur)}, reste à charge de ${h.eur(e.autre.resteACharge)}. Les plafonds viennent de la ${h.src('spMpr', 'page Service-Public sur MaPrimeRénov’')} ; le détail par couleur est sur la page ${h.a('plafonds-revenus-maprimerenov', 'plafonds de revenus')}.</p>
<h2>Maison en grande couronne, appartement en petite couronne</h2>
<p>La prime CEE suit la fiche ${h.src('bar171', 'BAR-TH-171')} : elle est presque deux fois plus forte pour une maison que pour un appartement, à surface comparable. La grande couronne, faite de maisons individuelles, concentre donc les primes les plus hautes ; Paris et la petite couronne relèvent surtout du collectif, traité sur la page ${h.a('pompe-a-chaleur-appartement', 'PAC en appartement')}.</p>`;
    },
  },
  en: {
    slug: 'heat-pump-ile-de-france',
    nav: 'Heat pump in Île-de-France',
    card: 'The 8 Paris-region départements, their grant ceilings and climate.',
    title: 'Heat pump in Île-de-France: grants and savings for 2026',
    description: 'Heat pumps in Île-de-France: the region’s own MaPrimeRénov’ ceilings, CEE bonus, Météo-France climate and yearly saving across all 8 of its départements.',
    h1: 'Heat pumps in Île-de-France: the 8 départements',
    intro: 'The table is filtered on Île-de-France: change the floor area, energy or insulation, or pick another region.',
    resume: (h) => {
      const e = exemple(h), p = h.dep('75'), m = h.dep('95');
      return `Île-de-France is the only region where MaPrimeRénov’ applies separate income ceilings, 30 to 40 % higher than in the rest of the country. The same household can therefore change colour, and flat rate, by crossing the regional border. Example: a household of ${e.personnes} with ${h.eur(e.rfr)} of reference tax income is ${nc(h, e.idf.couleur)} in Seine-et-Marne and ${nc(h, e.autre.couleur)} in Oise, a few kilometres away; for an air-to-water heat pump it receives ${h.eur(e.idf.aides)} of grants in all in the first case and ${h.eur(e.autre.aides)} in the second. All eight départements are in climate zone H1, which gives the highest CEE bonus factor. Climate does vary: Paris benefits from the urban heat island with ${h.num(p.dju)} degree-days at the Luxembourg station, while Val-d’Oise has ${h.num(m.dju)} at Pontoise. The table works out the heat pump’s consumption, the saving and the bonus for each département, at today’s energy prices.`;
    },
    faqs: (h) => [
      { q: 'Do you have to live in Île-de-France to get the regional ceilings?', a: 'Yes: what counts is the address of the home where the work is done, in one of the region’s eight départements. A household living in Île-de-France but renovating a main residence in Oise or Eure falls under the ceilings for the rest of France. The calculator applies the rule according to the département selected.' },
      { q: 'Why does Paris use less heating than the outer suburbs?', a: `The city holds heat: concrete, asphalt, heating and traffic add one or two degrees in winter. The Luxembourg station records ${h.num(h.dep('75').dju)} degree-days a year on average, against more than 2,200 at Melun or Pontoise. For the same house, the heat pump produces less heat there and the yearly saving is smaller.` },
      { q: 'Can a heat pump be fitted in a Paris apartment building?', a: 'Yes, but it needs the co-ownership’s approval as soon as the outdoor unit touches the façade, the roof or a shared courtyard, and often an opinion from the Architecte des Bâtiments de France in protected areas. The apartment heat pump page covers the cases and the CEE bonus for flats.' },
    ],
    body: (h) => {
      const e = exemple(h);
      return `<h2>The eight départements, from mildest to coldest</h2>
${tableRegion(h, CODES)}
<p>The gaps are moderate: every département in the region is in zone H1 and the CEE bonus is the same for a given house. What changes is the amount of heating, and so the saving. The interactive table at the top of the page redoes the calculation with your floor area, energy and insulation.</p>
<h2>Income ceilings specific to the region</h2>
${plafonds(h)}
<p>With ${h.eur(e.rfr)} of income for ${e.personnes} people, the example household is ${nc(h, e.idf.couleur)} in Île-de-France: a ${h.eur(e.idf.forfait)} flat rate for an air-to-water heat pump and a ${h.eur(e.idf.cee.eur)} CEE bonus, leaving ${h.eur(e.idf.resteACharge)} to pay on a ${h.eur(e.idf.prixTtc)} quote. In Oise it would be ${nc(h, e.autre.couleur)}: a ${h.eur(e.autre.forfait)} flat rate, a ${h.eur(e.autre.cee.eur)} bonus, ${h.eur(e.autre.resteACharge)} left to pay. The ceilings come from the ${h.src('spMpr', 'Service-Public page on MaPrimeRénov’')}; the detail by colour is on the ${h.a('plafonds-revenus-maprimerenov', 'income ceilings')} page.</p>
<h2>Houses in the outer ring, flats in the inner ring</h2>
<p>The CEE bonus follows sheet ${h.src('bar171', 'BAR-TH-171')}: it is almost twice as high for a house as for a flat of similar size. The outer ring, made of detached houses, therefore gets the highest bonuses; Paris and the inner ring are mostly apartment buildings, covered on the ${h.a('pompe-a-chaleur-appartement', 'apartment heat pump')} page.</p>`;
    },
  },
});
