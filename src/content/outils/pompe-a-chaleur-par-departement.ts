import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Moyennes par région (moteur du site). */
const regions = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const by = new Map<string, string[]>();
  for (const d of h.M.DEPARTEMENTS) by.set(d.region, [...(by.get(d.region) ?? []), d.code]);
  const rows = [...by.entries()].map(([r, codes]) => {
    const sims = codes.map((c) => h.M.simuler({ ...h.M.DEFAUT, dep: c, rfr: 50000 }));
    const m = (f: (x: (typeof sims)[number]) => number) => sims.reduce((s, x) => s + f(x), 0) / sims.length;
    return { r, n: codes.length, dju: m((x) => x.dju), eco: m((x) => x.economie) };
  }).sort((a, b) => a.dju - b.dju);
  return h.table(fr ? ['Région', 'Départements', 'DJU moyens', 'Économie moyenne / an'] : ['Region', 'Départements', 'Average HDD', 'Average saving / yr'],
    rows.map((x) => [x.r, h.num(x.n), h.num(x.dju), h.eur(x.eco)]),
    fr ? 'Moyenne simple des départements de chaque région ; maison de 100 m² à isolation moyenne, chaudière gaz remplacée par une PAC air/eau' : 'Simple average of each region’s départements; averagely insulated 100 m² house, gas boiler replaced by an air-to-water heat pump', ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-par-departement',
  group: 'territoires',
  order: 1,
  tool: 'departements',
  related: ['climat-degres-jours-departement', 'pompe-a-chaleur-ile-de-france', 'pompe-a-chaleur-hauts-de-france', 'pompe-a-chaleur-paca', 'consommation-pompe-a-chaleur'],
  sources: ['meteo', 'zones', 'ademe', 'bar171', 'emmy', 'cre', 'eurostatGaz'],
  fr: {
    slug: 'pompe-a-chaleur-par-departement',
    nav: 'PAC par département',
    card: 'Les 96 départements : climat, consommation, économie, prime CEE.',
    title: 'Pompe à chaleur par département : économie et aides en 2026',
    description: 'Pompe à chaleur dans les 96 départements : degrés-jours Météo-France, zone, consommation, économie annuelle et prime CEE, à trier et filtrer par région.',
    h1: 'Pompe à chaleur : le comparatif des 96 départements',
    intro: 'Choisissez la surface, l’énergie actuelle et l’isolation : le tableau recalcule l’économie et la prime pour chaque département métropolitain.',
    resume: (h) => {
      const all = h.M.parDju(), a = all[0], z = all[all.length - 1];
      const ea = h.M.simuler({ ...h.M.DEFAUT, dep: a.code }).economie, ez = h.M.simuler({ ...h.M.DEFAUT, dep: z.code }).economie;
      return `Le même projet de pompe à chaleur ne rapporte pas la même chose partout. Le climat fixe la quantité de chauffage à produire, donc l’économie ; la zone climatique fixe le facteur de la prime CEE ; l’Île-de-France a ses propres plafonds de revenus pour MaPrimeRénov’. Ce tableau applique le moteur du site aux 96 départements de métropole, avec les degrés-jours mesurés par Météo-France de 2015 à 2024 à la station la plus proche de chaque chef-lieu. Pour une maison de 100 m² moyennement isolée qui remplace une chaudière au gaz par une PAC air/eau, l’économie va de ${h.eur(ea)} par an en ${a.nom} à ${h.eur(ez)} en ${z.nom}. Les prix de l’énergie sont les mêmes partout : tarif bleu de l’électricité, prix moyen du gaz publié par Eurostat, prix moyen national du fioul. Vous pouvez trier par économie, par climat ou par prime, et filtrer par région. Pour un calcul complet avec votre devis et vos revenus, utilisez le simulateur de la page d’accueil.`;
    },
    faqs: (h) => [
      { q: 'Pourquoi l’économie est-elle plus forte dans les départements froids ?', a: 'Parce qu’on y chauffe davantage : l’écart entre la facture du gaz ou du fioul et celle de la PAC est proportionnel à la chaleur consommée. Un département à 2 500 degrés-jours chauffe presque deux fois plus qu’un département à 1 400. La prime CEE est aussi plus forte en zone H1 qu’en H3, d’un facteur de 1,2 contre 0,7.' },
      { q: 'Le prix des devis change-t-il selon le département ?', a: 'Probablement, mais aucune source ouverte ne publie de prix de PAC par département. Le tableau n’en tient donc pas compte et ne calcule que l’économie et la prime CEE. Saisissez votre propre devis dans le simulateur pour obtenir le reste à charge et le temps de retour réels.' },
      { q: 'Les départements d’outre-mer sont-ils couverts ?', a: 'Non. Le chauffage y est rarement nécessaire, les zones climatiques et les fiches CEE y sont différentes, et MaPrimeRénov’ a d’autres règles. Le site ne couvre que la France métropolitaine, Corse comprise, soit 96 départements. Pour l’outre-mer, adressez-vous à un conseiller France Rénov’ local.' },
    ],
    body: (h) => `<h2>Les régions, de la plus douce à la plus froide</h2>
${regions(h)}
<p>Chaque région a des écarts internes importants : la plaine et la montagne, le littoral et l’intérieur. Le tableau interactif ci-dessus donne le détail par département, et les pages ${h.a('pompe-a-chaleur-ile-de-france', 'Île-de-France')}, ${h.a('pompe-a-chaleur-hauts-de-france', 'Hauts-de-France')} et ${h.a('pompe-a-chaleur-paca', 'Provence-Alpes-Côte d’Azur')} détaillent trois régions.</p>
<h2>D’où viennent les chiffres</h2>
<p>Les degrés-jours sont calculés par le site à partir des relevés quotidiens de Météo-France (voir ${h.a('climat-degres-jours-departement', 'degrés-jours par département')}). La zone climatique vient de l’arrêté du 26 octobre 2010. Le rendement de la PAC est la moyenne mesurée par l’ADEME. La prime CEE suit la fiche BAR-TH-171, avec Coup de pouce, au prix moyen du registre Emmy.</p>`,
  },
  en: {
    slug: 'heat-pump-by-departement',
    nav: 'Heat pump by département',
    card: 'All 96 départements: climate, consumption, saving, CEE bonus.',
    title: 'Heat pump by département in France: savings and grants 2026',
    description: 'Heat pumps in all 96 French départements: Météo-France degree-days, climate zone, consumption, yearly saving and CEE bonus, sortable and filterable by region.',
    h1: 'Heat pumps: all 96 départements compared',
    intro: 'Choose the floor area, current energy and insulation: the table recalculates the saving and bonus for every mainland département.',
    resume: (h) => {
      const all = h.M.parDju(), a = all[0], z = all[all.length - 1];
      const ea = h.M.simuler({ ...h.M.DEFAUT, dep: a.code }).economie, ez = h.M.simuler({ ...h.M.DEFAUT, dep: z.code }).economie;
      return `The same heat pump project does not pay the same everywhere. Climate sets how much heat must be produced, and so the saving; the climate zone sets the CEE bonus factor; Île-de-France has its own MaPrimeRénov’ income ceilings. This table applies the site’s engine to the 96 mainland départements, with degree-days measured by Météo-France from 2015 to 2024 at the station nearest each main town. For an averagely insulated 100 m² house replacing a gas boiler with an air-to-water heat pump, the saving ranges from ${h.eur(ea)} a year in ${a.nom} to ${h.eur(ez)} in ${z.nom}. Energy prices are the same everywhere: the regulated electricity tariff, the average gas price published by Eurostat, the national average oil price. You can sort by saving, climate or bonus, and filter by region. For a full calculation with your quote and income, use the calculator on the home page.`;
    },
    faqs: (h) => [
      { q: 'Why is the saving larger in cold départements?', a: 'Because more heating is used there: the gap between the gas or oil bill and the heat pump’s is proportional to the heat consumed. A département with 2,500 degree-days heats almost twice as much as one with 1,400. The CEE bonus is also higher in zone H1 than H3, by a factor of 1.2 against 0.7.' },
      { q: 'Do quote prices vary by département?', a: 'Probably, but no open source publishes heat pump prices by département. The table therefore ignores them and only works out the saving and CEE bonus. Enter your own quote in the calculator to get the real out-of-pocket cost and payback time.' },
      { q: 'Are the overseas départements covered?', a: 'No. Heating is rarely needed there, climate zones and CEE sheets differ, and MaPrimeRénov’ has other rules. The site covers mainland France only, Corsica included, which is 96 départements. For overseas France, ask a local France Rénov’ adviser, who knows the specific grants that apply there.' },
    ],
    body: (h) => `<h2>Regions, from mildest to coldest</h2>
${regions(h)}
<p>Each region has large internal gaps: plain and mountain, coast and inland. The interactive table above gives the detail by département, and the ${h.a('pompe-a-chaleur-ile-de-france', 'Île-de-France')}, ${h.a('pompe-a-chaleur-hauts-de-france', 'Hauts-de-France')} and ${h.a('pompe-a-chaleur-paca', 'Provence-Alpes-Côte d’Azur')} pages cover three regions in detail.</p>
<h2>Where the figures come from</h2>
<p>Degree-days are calculated by the site from Météo-France daily records (see ${h.a('climat-degres-jours-departement', 'degree-days by département')}). The climate zone comes from the order of 26 October 2010. Heat pump efficiency is ADEME’s measured average. The CEE bonus follows sheet BAR-TH-171, with Coup de pouce, at the Emmy registry average price.</p>`,
  },
});
