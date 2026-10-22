import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Prix d'une installation air/air selon la puissance, au prix au kW de l'observatoire. */
const grille = (h: Helpers) => {
  const fr = h.lang === 'fr';
  return h.table(fr ? ['Puissance totale', 'Exemple d’usage', '1 devis sur 10 sous', 'Médiane', '1 devis sur 10 au-dessus'] : ['Total output', 'Typical use', '1 quote in 10 below', 'Median', '1 quote in 10 above'],
    ([[2.5, 'une chambre', 'one bedroom'], [5, 'un séjour ouvert', 'an open-plan living room'], [7, 'un appartement de trois pièces', 'a three-room flat'], [10, 'une maison de plain-pied', 'a single-storey house']] as Array<[number, string, string]>).map(([kw, f, e]) => {
      const p = h.M.prixParKw(kw, 'air_air');
      return [`${h.num(kw, 1)} kW`, fr ? f : e, h.eur(p.bas!), h.eur(p.median), h.eur(p.haut!)];
    }), fr ? 'Estimation au prix par kW des devis air/air de l’observatoire ScoreSolaire ; les usages sont des exemples, pas un dimensionnement' : 'Estimate at the per-kW price of the ScoreSolaire observatory’s air-to-air quotes; uses are examples, not a sizing', ['l', 'l', 'r', 'r', 'r']);
};

/** Air/air à la place de radiateurs électriques : économie et retour selon le climat (moteur du site). */
const climatAirAir = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = ['83', '33', '69', '67', '05'].map((c) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, dep: c, energie: 'elec', type: 'air_air' }), d = h.dep(c);
    return [`${d.nom} (${h.num(d.dju)} DJU)`, h.eur(r.coutAvant), h.eur(r.economie), r.retourAns === null ? '—' : `${h.num(r.retourAns, 0)} ${fr ? 'ans' : 'yrs'}`];
  });
  return h.table(fr ? ['Département', 'Facture radiateurs', 'Économie / an', 'Retour'] : ['Département', 'Radiator bill', 'Saving / yr', 'Payback'], rows,
    fr ? `Maison de 100 m² à isolation moyenne ; PAC air/air au prix médian de ${h.eur(h.P.prix_installation.air_air.median_ttc)}, sans aide ; rendement par défaut de la méthode DPE (${h.num(h.P.rendements.scop.air_air.H1, 1)} en zones H1 et H2, ${h.num(h.P.rendements.scop.air_air.H3, 1)} en zone H3)` : `Averagely insulated 100 m² house; air-to-air heat pump at the ${h.eur(h.P.prix_installation.air_air.median_ttc)} median price, no grant; DPE method default efficiency (${h.num(h.P.rendements.scop.air_air.H1, 1)} in zones H1 and H2, ${h.num(h.P.rendements.scop.air_air.H3, 1)} in zone H3)`, ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-air-air',
  group: 'prix',
  order: 3,
  mini: 'prixKw',
  related: ['prix-pompe-a-chaleur', 'pompe-a-chaleur-air-eau', 'remplacer-radiateurs-electriques', 'pompe-a-chaleur-paca', 'consommation-pompe-a-chaleur'],
  sources: ['observatoire', 'spMpr', 'tva', 'ademe'],
  fr: {
    slug: 'pompe-a-chaleur-air-air',
    nav: 'PAC air/air (clim réversible)',
    card: 'Prix au kW sur 148 devis, sans MaPrimeRénov’, TVA réduite possible.',
    title: 'Pompe à chaleur air/air prix 2026 : tarif au kW et aides',
    description: 'Pompe à chaleur air/air en 2026 : prix au kW sur 148 devis réels, fourchette selon la puissance, plus de MaPrimeRénov’, TVA réduite à 5,5 % sous conditions.',
    h1: 'Pompe à chaleur air/air réversible : prix et aides en 2026',
    intro: 'Une clim réversible chauffe l’hiver et rafraîchit l’été. Elle coûte moins cher qu’une PAC air/eau, mais n’a plus droit à MaPrimeRénov’.',
    resume: (h) => {
      const O = h.P.prix_installation.air_air;
      return `Une pompe à chaleur air/air prend la chaleur de l’air extérieur et la souffle directement dans les pièces par des unités murales, en console ou gainables ; réversible, elle sert aussi de climatisation. D’après les ${h.num(O.n)} devis air/air publiés par l’observatoire ScoreSolaire (licence CC BY 4.0), le prix médian d’une installation est de ${h.eur(O.median_ttc)} TTC, soit ${h.eur(O.eur_par_kw)} par kilowatt de puissance ; un devis sur dix est sous ${h.eur(O.eur_par_kw_p10)} par kilowatt, un sur dix au-dessus de ${h.eur(O.eur_par_kw_p90)}. Elle coûte donc nettement moins qu’une PAC air/eau, mais ne chauffe pas l’eau sanitaire et ne se branche pas sur des radiateurs. MaPrimeRénov’ par geste ne la finance plus : le barème en vigueur au 1er septembre 2026 ne l’a pas réintroduite. Elle peut bénéficier de la TVA à 5,5 % si l’équipement respecte les critères de performance, et d’une prime CEE au titre d’une fiche distincte que nous ne chiffrons pas, faute d’en avoir relu le texte en vigueur.`;
    },
    faqs: (h) => [
      { q: 'Une clim réversible peut-elle chauffer toute une maison ?', a: 'Oui si chaque pièce à vivre a son unité intérieure ou si un réseau gainable dessert les pièces, et si la puissance totale couvre les déperditions par grand froid. Les chambres fermées et la salle de bains restent souvent mal chauffées avec une seule unité dans le séjour. Pour une maison entière avec radiateurs à eau, la PAC air/eau est l’outil prévu.' },
      { q: 'Quel rendement attendre d’une PAC air/air ?', a: `Les devis de l’observatoire annoncent un SCOP moyen de 4,5. C’est une valeur annoncée par les fabricants, pas une mesure chez des particuliers. Faute de campagne de mesure publique sur l’air/air, ce site retient la valeur par défaut de la méthode officielle du DPE pour une PAC air/air posée depuis 2015 : ${h.num(h.P.rendements.scop.air_air.H1, 1)} en zones H1 et H2, ${h.num(h.P.rendements.scop.air_air.H3, 1)} en zone H3. C’est une valeur conventionnelle, pas une mesure ; vous pouvez la remplacer dans le simulateur.` },
      { q: 'Existe-t-il encore une aide pour une PAC air/air en 2026 ?', a: 'Pas de MaPrimeRénov’. Une prime CEE reste possible au titre de la fiche BAR-TH-129, versée par un fournisseur d’énergie qui doit intervenir avant la signature du devis ; demandez son montant écrit. La TVA réduite à 5,5 % s’applique si l’équipement respecte les critères de performance et est posé par une entreprise dans un logement de plus de deux ans.' },
    ],
    body: (h) => `<h2>Prix selon la puissance</h2>
<p>Le prix d’une installation air/air dépend d’abord de la puissance et du nombre d’unités intérieures : un mono-split pour une pièce, un multi-split avec un groupe extérieur pour trois ou quatre unités, ou un gainable qui distribue l’air par des conduits dans les combles. L’observatoire publie un prix médian par kilowatt, qui permet de comparer des devis de tailles différentes :</p>
${grille(h)}
<p>Le rapport de 2,2 entre le premier et le dernier décile, à puissance égale, montre l’intérêt de demander deux ou trois devis. Le mini-simulateur ci-dessous fait le calcul pour la puissance de votre devis.</p>
<!--mini:prixKw-->
<h2>Pourquoi elle n’a plus MaPrimeRénov’</h2>
<p>La fiche Service-Public de MaPrimeRénov’, vérifiée le 1er septembre 2026, liste les seuls travaux encore financés par geste en métropole : PAC géothermique, PAC air/eau, raccordement à un réseau de chaleur, dépose d’une cuve à fioul et audit énergétique. La PAC air/air n’y figure pas. Méfiez-vous des pages qui annoncent encore une MaPrimeRénov’ pour une clim réversible : elles recopient un ancien barème. Le ${h.a('home', 'simulateur')} affiche zéro de MaPrimeRénov’ dès que vous choisissez l’air/air.</p>
<h2>Consommation et coût d’usage</h2>
<p>En chauffage, une PAC air/air consomme la chaleur qu’elle fournit divisée par son rendement. Pour remplacer des radiateurs électriques, l’économie est directe : la même chaleur pour une fraction de l’électricité. Pour remplacer une chaudière fioul ou gaz, il faut aussi garder une solution pour l’eau chaude, ce qui réduit l’intérêt. L’été, la climatisation ajoute une consommation que ce site ne chiffre pas, faute de donnée fiable sur l’usage.</p>
<p>Le climat compte : par grand froid, le rendement d’une PAC air/air baisse et sa puissance aussi. Dans les départements de montagne et de l’Est, vérifiez la puissance garantie à −7 °C sur la fiche technique. Sur la côte méditerranéenne, où l’hiver est doux, la PAC air/air est souvent la solution la plus rentable, comme le montre la page ${h.a('pompe-a-chaleur-paca', 'Provence-Alpes-Côte d’Azur')}.</p>
<h2>Face aux radiateurs électriques, selon le climat</h2>
${climatAirAir(h)}
<p>Plus l’hiver est long, plus l’économie est forte et le retour rapide, même sans aide. Le rendement réel d’une PAC air/air n’est pas publié par une mesure indépendante : le site prend celui de l’air/eau, à corriger avec le SCOP de votre devis.</p>
<h2>Les points à vérifier sur le devis</h2>
<p>La puissance de chaque unité et la puissance totale du groupe extérieur ; le SCOP et la classe énergétique en chauffage ; le niveau sonore de l’unité extérieure, qui compte en lotissement et en copropriété ; la longueur des liaisons frigorifiques et le passage des goulottes ; la mise en service par un frigoriste certifié pour la manipulation des fluides ; le taux de TVA appliqué. Pour une copropriété, l’accord de l’assemblée générale est en général nécessaire avant de poser un groupe extérieur en façade ou sur un balcon.</p>`,
  },
  en: {
    slug: 'air-to-air-heat-pump-price',
    nav: 'Air-to-air heat pump',
    card: 'Price per kW from 148 quotes, no MaPrimeRénov’, reduced VAT possible.',
    title: 'Air-to-air heat pump price France 2026: per kW, no grant',
    description: 'Air-to-air heat pump in France in 2026: price per kW from 148 real quotes, range by output, no more MaPrimeRénov’, 5.5% VAT under conditions, running costs.',
    h1: 'Air-to-air heat pump: price and grants in 2026',
    intro: 'Reversible air conditioning heats in winter and cools in summer. It costs less than an air-to-water heat pump, but no longer qualifies for MaPrimeRénov’.',
    resume: (h) => {
      const O = h.P.prix_installation.air_air;
      return `An air-to-air heat pump takes heat from the outside air and blows it straight into the rooms through wall-mounted, floor-standing or ducted indoor units; being reversible, it also works as air conditioning. Based on the ${h.num(O.n)} air-to-air quotes published by the ScoreSolaire observatory (CC BY 4.0 licence), the median installation costs ${h.eur(O.median_ttc)} including VAT, or ${h.eur(O.eur_par_kw)} per kilowatt of output; one quote in ten is below ${h.eur(O.eur_par_kw_p10)} per kilowatt, one in ten above ${h.eur(O.eur_par_kw_p90)}. It is therefore much cheaper than an air-to-water unit, but it does not heat domestic water and cannot feed radiators. The per-item MaPrimeRénov’ no longer funds it: the scale in force on 1 September 2026 has not brought it back. It can get 5.5% VAT if the equipment meets the performance criteria, and a CEE bonus under a separate sheet that we do not calculate, having not reread the text in force.`;
    },
    faqs: (h) => [
      { q: 'Can reversible air conditioning heat a whole house?', a: 'Yes if every living room has its own indoor unit or a ducted system serves the rooms, and if the total output covers heat losses in hard frosts. Closed bedrooms and the bathroom often stay cold with a single unit in the living room. For a whole house with water radiators, the air-to-water heat pump is the intended tool.' },
      { q: 'What efficiency can an air-to-air heat pump achieve?', a: `The observatory’s quotes announce an average SCOP of 4.5. That is a manufacturer’s figure, not a measurement in people’s homes. With no public field campaign on air-to-air units, this site uses the official DPE method’s default value for an air-to-air unit fitted since 2015: ${h.num(h.P.rendements.scop.air_air.H1, 1)} in zones H1 and H2, ${h.num(h.P.rendements.scop.air_air.H3, 1)} in zone H3. It is a conventional value, not a measurement; you can replace it in the calculator.` },
      { q: 'Is there still any grant for an air-to-air heat pump in 2026?', a: 'No MaPrimeRénov’. A CEE bonus remains possible under sheet BAR-TH-129, paid by an energy supplier that must be involved before you sign the quote; ask for the amount in writing. Reduced 5.5% VAT applies if the equipment meets the performance criteria and is fitted by a firm in a home over two years old.' },
    ],
    body: (h) => `<h2>Price by output</h2>
<p>The price of an air-to-air installation depends first on output and the number of indoor units: a single split for one room, a multi-split with one outdoor unit for three or four indoor units, or a ducted system distributing air through ducts in the loft. The observatory publishes a median price per kilowatt, which lets you compare quotes of different sizes:</p>
${grille(h)}
<p>The 2.2 ratio between the bottom and top deciles, at equal output, shows why two or three quotes are worth getting. The mini calculator below does the sum for the output on your quote.</p>
<!--mini:prixKw-->
<h2>Why it lost MaPrimeRénov’</h2>
<p>The Service-Public page on MaPrimeRénov’, checked on 1 September 2026, lists the only works still funded per item in mainland France: ground-source heat pumps, air-to-water heat pumps, district heating connection, oil tank removal and the energy audit. Air-to-air is not on it. Be wary of pages still promising MaPrimeRénov’ for reversible air conditioning: they copy an old scale. The ${h.a('home', 'calculator')} shows zero MaPrimeRénov’ as soon as you pick air-to-air.</p>
<h2>Consumption and running cost</h2>
<p>For heating, an air-to-air heat pump uses the heat it delivers divided by its efficiency. Replacing electric heaters, the saving is direct: the same heat for a fraction of the electricity. Replacing an oil or gas boiler, you also need another way to heat water, which reduces the benefit. In summer, cooling adds consumption that this site does not estimate, for lack of reliable usage data.</p>
<p>Climate matters: in hard frosts an air-to-air unit loses efficiency and output. In mountain and eastern départements, check the output guaranteed at −7 °C on the data sheet. On the Mediterranean coast, where winters are mild, air-to-air is often the most cost-effective option, as the ${h.a('pompe-a-chaleur-paca', 'Provence-Alpes-Côte d’Azur page')} shows.</p>
<h2>Against electric radiators, by climate</h2>
${climatAirAir(h)}
<p>The longer the winter, the larger the saving and the faster the payback, even without a grant. No independent measurement publishes the real-world efficiency of air-to-air heat pumps: the site uses the air-to-water figure, which you can correct with the SCOP on your quote. In a mild département the payback stretches out because the radiator bill being replaced is small to begin with; in a cold one, check that the units are sized for the coldest days, or the radiators will still run in January and eat into the saving.</p>
<h2>What to check on the quote</h2>
<p>The output of each unit and the total output of the outdoor unit; the SCOP and heating energy class; the outdoor unit’s noise level, which matters on estates and in blocks of flats; the length of refrigerant lines and how trunking is routed; commissioning by a refrigeration engineer certified to handle refrigerants; the VAT rate applied. In a block of flats, the general meeting of co-owners usually has to approve an outdoor unit on a façade or balcony.</p>`,
  },
});
