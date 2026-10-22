import { defineGuide, type Helpers } from '../../lib/guide-types';

const DEPS = ['06', '33', '69', '75', '67', '25', '15'];
const ISOS = ['faible', 'moyenne', 'bonne', 'bbc'] as const;

/** Puissance demandée pendant les 3 jours les plus froids, 100 m², par département et isolation (moteur du site). */
const grille = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = [...DEPS].sort((x, y) => h.dep(y).tbase - h.dep(x).tbase).map((c) => { const d = h.dep(c); return [`${d.nom} (${d.code})`, `${h.num(d.tbase, 1)} °C`, ...ISOS.map((i) => `${h.num(h.M.puissanceFroid(100, i, d.tbase), 1)} kW`)]; });
  return h.table(fr ? ['Département', 'Froid typique', 'Peu isolée', 'Moyenne', 'Bien isolée', 'BBC'] : ['Département', 'Typical cold', 'Poorly insulated', 'Average', 'Well insulated', 'Low-energy'], rows,
    fr ? 'Maison de 100 m², 2,5 m sous plafond, 19 °C intérieur ; froid typique = moyenne des 3 jours consécutifs les plus froids de chaque hiver, Météo-France 2015-2024' : '100 m² house, 2.5 m ceilings, 19 °C indoors; typical cold = average of each winter’s 3 coldest consecutive days, Météo-France 2015-2024', ['l', 'r', 'r', 'r', 'r', 'r']);
};

const G = (h: Helpers) => h.table(h.lang === 'fr' ? ['Isolation', 'Coefficient G (W/m³·°C)', 'Exemple'] : ['Insulation', 'G coefficient (W/m³·°C)', 'Example'],
  h.lang === 'fr'
    ? [['Peu isolée', h.num(h.M.G.faible, 2), 'Maison d’avant 1975 jamais rénovée'], ['Moyenne', h.num(h.M.G.moyenne, 2), 'Combles isolés, double vitrage'], ['Bien isolée', h.num(h.M.G.bonne, 2), 'Murs, combles et fenêtres rénovés'], ['BBC', h.num(h.M.G.bbc, 2), 'Bâtiment basse consommation, RT 2012']]
    : [['Poorly insulated', h.num(h.M.G.faible, 2), 'Pre-1975 house never renovated'], ['Average', h.num(h.M.G.moyenne, 2), 'Insulated loft, double glazing'], ['Well insulated', h.num(h.M.G.bonne, 2), 'Walls, loft and windows renovated'], ['Low-energy', h.num(h.M.G.bbc, 2), 'Low-energy building, RT 2012']],
  h.lang === 'fr' ? 'Hypothèses de calcul du site (ordres de grandeur usuels), modifiables dans le simulateur par le choix de l’isolation' : 'The site’s working assumptions (usual orders of magnitude), changed in the calculator by the insulation choice', ['l', 'r', 'l']);

export default defineGuide({
  id: 'puissance-pompe-a-chaleur',
  group: 'prix',
  order: 5,
  mini: 'puissance',
  related: ['pompe-a-chaleur-air-eau', 'climat-degres-jours-departement', 'consommation-pompe-a-chaleur', 'prix-pompe-a-chaleur', 'pompe-a-chaleur-par-departement'],
  sources: ['meteo', 'observatoire', 'ademe'],
  fr: {
    slug: 'puissance-pompe-a-chaleur',
    nav: 'Puissance d’une PAC',
    card: 'kW nécessaires selon le froid de votre département et l’isolation.',
    title: 'Puissance pompe à chaleur : kW selon surface et département',
    description: 'Puissance d’une pompe à chaleur : kW nécessaires selon la surface, l’isolation et le froid réel de votre département (Météo-France 2015-2024), et prix au kW.',
    h1: 'Puissance d’une pompe à chaleur : combien de kW pour votre maison',
    intro: 'La règle « 100 W par m² » ignore votre climat et votre isolation. Voici la puissance que demande votre maison pendant les jours les plus froids de chez vous.',
    resume: (h) => {
      const d1 = h.dep('06'), d2 = h.dep('25');
      return `La puissance d’une pompe à chaleur se choisit pour couvrir les déperditions de la maison quand il fait le plus froid. On la calcule avec le coefficient de déperdition du logement (G, en watts par mètre cube et par degré d’écart), le volume chauffé et l’écart entre 19 °C à l’intérieur et la température extérieure de référence. Le site prend comme froid de référence la moyenne des trois jours consécutifs les plus froids de chaque hiver, mesurée par Météo-France de 2015 à 2024 à la station du chef-lieu : ${h.num(d1.tbase, 1)} °C dans les Alpes-Maritimes, ${h.num(d2.tbase, 1)} °C dans le Doubs. Pour une maison moyenne de 100 m², il faut alors ${h.num(h.M.puissanceFroid(100, 'moyenne', d1.tbase), 1)} kW à Nice et ${h.num(h.M.puissanceFroid(100, 'moyenne', d2.tbase), 1)} kW à Besançon. C’est un ordre de grandeur : l’installateur dimensionne avec la température de base de la norme, plus basse, et doit vous remettre une étude thermique. Une PAC trop puissante coûte plus cher et s’use en marche-arrêt ; trop faible, elle laisse la résistance d’appoint chauffer.`;
    },
    faqs: (h) => [
      { q: 'Quelle puissance de pompe à chaleur pour 100 m² ?', a: `Pour une maison moyennement isolée de 100 m², le calcul du site donne de ${h.num(h.M.puissanceFroid(100, 'moyenne', h.dep('06').tbase), 1)} kW sur la Côte d’Azur à ${h.num(h.M.puissanceFroid(100, 'moyenne', h.dep('25').tbase), 1)} kW dans le Doubs, pendant les trois jours les plus froids d’un hiver typique. Une maison peu isolée demande environ 45 % de plus, une maison BBC deux fois moins. L’installateur ajoute une marge pour les grands froids.` },
      { q: 'Faut-il prendre une PAC plus puissante par sécurité ?', a: 'Non. Une pompe à chaleur surdimensionnée coûte plus cher à l’achat, démarre et s’arrête sans cesse en mi-saison, ce qui use le compresseur et dégrade le rendement. On la dimensionne en général pour couvrir 80 à 100 % des besoins au froid de base, une résistance d’appoint prenant le relais les rares jours les plus froids.' },
      { q: 'Quelle est la différence entre le froid typique du site et la température de base ?', a: 'La température de base de la norme NF EN 12831 est un froid extrême, de l’ordre de −5 à −15 °C selon la zone et l’altitude, que l’installateur utilise pour dimensionner. Le site, faute de table ouverte, mesure le froid typique de chaque hiver sur les relevés Météo-France. Il donne donc une puissance plus basse, utile pour juger un devis, pas pour le remplacer.' },
    ],
    body: (h) => `<h2>Le calcul, pas à pas</h2>
<p>La puissance demandée est égale à G × volume × (19 °C − froid de référence). Le volume vaut la surface chauffée multipliée par la hauteur sous plafond, 2,5 m par défaut. Le coefficient G résume l’isolation : c’est le nombre de watts que perd chaque mètre cube pour un degré d’écart entre l’intérieur et l’extérieur. Le site retient quatre valeurs usuelles :</p>
${G(h)}
<p>Ces coefficients sont des hypothèses, pas des mesures de votre maison. Le seul moyen d’avoir le vrai chiffre est une étude thermique pièce par pièce, que l’installateur doit faire avant de proposer une puissance. Si votre devis annonce une puissance sans aucun calcul, demandez-le.</p>
<h2>La puissance selon le département</h2>
<p>Le froid de référence change beaucoup d’un département à l’autre, et la puissance avec lui. Pour une maison de 100 m² :</p>
${grille(h)}
<p>Les sept départements du tableau vont du plus doux au plus rude. Les 96 départements métropolitains, avec leur station et leur froid typique, sont sur la page ${h.a('pompe-a-chaleur-par-departement', 'pompe à chaleur par département')}.</p>
<h2>Puissance et prix</h2>
<p>Le prix d’une PAC dépend d’abord de sa puissance. Sur les ${h.num(h.P.prix_installation.air_eau.n)} devis de PAC air/eau publiés par l’observatoire des prix en 2026, la médiane est de ${h.eur(h.P.prix_installation.air_eau.eur_par_kw)} par kW installé ; sur les ${h.num(h.P.prix_installation.air_air.n)} devis d’air/air, ${h.eur(h.P.prix_installation.air_air.eur_par_kw)} par kW. Une maison moyenne de 100 m² dans le Rhône, à ${h.num(h.M.puissanceFroid(100, 'moyenne', h.dep('69').tbase), 1)} kW, représente donc environ ${h.eur(h.M.prixParKw(h.M.puissanceFroid(100, 'moyenne', h.dep('69').tbase), 'air_eau').median)} en air/eau à ce prix médian, une estimation à comparer à vos devis. L’échantillon air/eau est petit : la fourchette réelle est large.</p>
<!--mini:puissance-->
<h2>Puissance et consommation ne sont pas la même chose</h2>
<p>La puissance (en kW) dit ce que la PAC doit fournir au pire moment de l’hiver ; la consommation (en kWh par an) dit ce qu’elle dépense sur toute la saison. Une maison peut demander 8 kW par grand froid et ne consommer que 4 000 kWh d’électricité sur l’année, parce que la plupart des jours sont bien plus doux. La consommation se calcule avec les degrés-jours, expliqués sur la page ${h.a('climat-degres-jours-departement', 'climat et degrés-jours')}, et elle est chiffrée sur la page ${h.a('consommation-pompe-a-chaleur', 'consommation d’une PAC')}.</p>
<h2>Isoler avant de changer de chauffage</h2>
<p>Passer d’une maison peu isolée à une maison bien isolée divise la puissance nécessaire par plus de deux. Si vous prévoyez d’isoler les combles ou de changer les fenêtres dans les années à venir, faites-le avant : vous achèterez une PAC plus petite, moins chère, qui tournera dans de meilleures conditions. MaPrimeRénov’ finance aussi les travaux d’isolation, par geste ou dans une rénovation d’ampleur.</p>`,
  },
  en: {
    slug: 'heat-pump-sizing',
    nav: 'Heat pump sizing',
    card: 'kW needed for your département’s cold and your insulation.',
    title: 'Heat pump sizing France: kW by floor area and département',
    description: 'Heat pump sizing in France: kW needed by floor area, insulation and the real cold of your département (Météo-France 2015-2024), plus the price per kW installed.',
    h1: 'Heat pump sizing: how many kW your house needs',
    intro: 'The “100 W per m²” rule ignores your climate and insulation. Here is the output your house needs during the coldest days where you live.',
    resume: (h) => {
      const d1 = h.dep('06'), d2 = h.dep('25');
      return `A heat pump’s output is chosen to cover the house’s heat losses when it is coldest. It is worked out from the home’s heat-loss coefficient (G, in watts per cubic metre per degree of difference), the heated volume and the gap between 19 °C indoors and the reference outdoor temperature. The site takes as its reference cold the average of the three coldest consecutive days of each winter, measured by Météo-France from 2015 to 2024 at the station of the département’s main town: ${h.num(d1.tbase, 1)} °C in the Alpes-Maritimes, ${h.num(d2.tbase, 1)} °C in the Doubs. An average 100 m² house then needs ${h.num(h.M.puissanceFroid(100, 'moyenne', d1.tbase), 1)} kW in Nice and ${h.num(h.M.puissanceFroid(100, 'moyenne', d2.tbase), 1)} kW in Besançon. This is an order of magnitude: the installer sizes with the standard’s design temperature, which is lower, and must give you a heat-loss study. An oversized heat pump costs more and wears out cycling on and off; an undersized one leaves the backup heater doing the work.`;
    },
    faqs: (h) => [
      { q: 'What size heat pump for 100 m²?', a: `For an averagely insulated 100 m² house, the site’s calculation gives from ${h.num(h.M.puissanceFroid(100, 'moyenne', h.dep('06').tbase), 1)} kW on the Riviera to ${h.num(h.M.puissanceFroid(100, 'moyenne', h.dep('25').tbase), 1)} kW in the Doubs, during the three coldest days of a typical winter. A poorly insulated house needs about 45% more, a low-energy house half as much. The installer adds a margin for severe frosts.` },
      { q: 'Should I buy a more powerful heat pump to be safe?', a: 'No. An oversized heat pump costs more to buy, starts and stops constantly in spring and autumn, which wears the compressor and lowers efficiency. It is usually sized to cover 80 to 100% of needs at the design temperature, with a backup heater taking over on the few coldest days of the year.' },
      { q: 'How does the site’s typical cold differ from the design temperature?', a: 'The design temperature of standard NF EN 12831 is an extreme cold, around −5 to −15 °C depending on zone and altitude, which installers use for sizing. Lacking an open table, the site measures each winter’s typical cold from Météo-France records. It therefore gives a lower output, useful for judging a quote, not for replacing the study.' },
    ],
    body: (h) => `<h2>The calculation, step by step</h2>
<p>The output needed equals G × volume × (19 °C − reference cold). Volume is the heated floor area times the ceiling height, 2.5 m by default. The G coefficient sums up insulation: it is how many watts each cubic metre loses per degree of difference between inside and outside. The site uses four usual values:</p>
${G(h)}
<p>These coefficients are assumptions, not measurements of your house. The only way to get the real figure is a room-by-room heat-loss study, which the installer should carry out before proposing an output. If your quote states an output with no calculation at all, ask for it.</p>
<h2>Output by département</h2>
<p>The reference cold varies a lot between départements, and the output with it. For a 100 m² house:</p>
${grille(h)}
<p>The seven départements in the table run from mildest to harshest. All 96 mainland départements, with their station and typical cold, are on the ${h.a('pompe-a-chaleur-par-departement', 'heat pump by département')} page.</p>
<h2>Output and price</h2>
<p>A heat pump’s price depends first on its output. Across the ${h.num(h.P.prix_installation.air_eau.n)} air-to-water quotes published by the price observatory in 2026, the median is ${h.eur(h.P.prix_installation.air_eau.eur_par_kw)} per kW installed; across the ${h.num(h.P.prix_installation.air_air.n)} air-to-air quotes, ${h.eur(h.P.prix_installation.air_air.eur_par_kw)} per kW. An average 100 m² house in the Rhône, at ${h.num(h.M.puissanceFroid(100, 'moyenne', h.dep('69').tbase), 1)} kW, therefore comes to about ${h.eur(h.M.prixParKw(h.M.puissanceFroid(100, 'moyenne', h.dep('69').tbase), 'air_eau').median)} for air-to-water at that median price, an estimate to compare with your quotes. The air-to-water sample is small: the real range is wide.</p>
<!--mini:puissance-->
<h2>Output and consumption are not the same thing</h2>
<p>Output (in kW) is what the heat pump must deliver at the worst moment of winter; consumption (in kWh per year) is what it uses over the whole season. A house may need 8 kW in a hard frost yet use only 4,000 kWh of electricity over the year, because most days are much milder. Consumption is worked out with degree-days, explained on the ${h.a('climat-degres-jours-departement', 'climate and degree-days')} page, and costed on the ${h.a('consommation-pompe-a-chaleur', 'heat pump running cost')} page.</p>
<h2>Insulate before changing your heating</h2>
<p>Going from a poorly insulated to a well insulated house more than halves the output needed. If you plan to insulate the loft or replace windows in the coming years, do it first: you will buy a smaller, cheaper heat pump that runs in better conditions. MaPrimeRénov’ also funds insulation work, per item or within a whole-home renovation.</p>`,
  },
});
