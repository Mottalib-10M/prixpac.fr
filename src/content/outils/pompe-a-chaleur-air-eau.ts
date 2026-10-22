import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Reste à charge d'une PAC air/eau au prix médian, par couleur, avec et sans Coup de pouce. */
const parCouleur = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const cas: Array<[number, string, string]> = [[20000, 'Bleu', 'Blue'], [35000, 'Jaune', 'Yellow'], [50000, 'Violet', 'Purple'], [90000, 'Rose', 'Pink']];
  return h.table(fr ? ['Catégorie', 'MaPrimeRénov’', 'Prime CEE', 'Reste à charge', 'Sans Coup de pouce'] : ['Category', 'MaPrimeRénov’', 'CEE bonus', 'Out of pocket', 'Without Coup de pouce'],
    cas.map(([rfr, f, e]) => {
      const a = h.M.simuler({ ...h.M.DEFAUT, rfr }), b = h.M.simuler({ ...h.M.DEFAUT, rfr, energie: 'elec' });
      return [fr ? f : e, h.eur(a.mpr), h.eur(a.cee.eur), h.eur(a.resteACharge), h.eur(b.resteACharge)];
    }), fr ? 'PAC air/eau au prix médian, maison de 100 m² dans le Rhône (zone H1), foyer de 3 personnes ; « sans Coup de pouce » : radiateurs électriques remplacés' : 'Air-to-water heat pump at the median price, 100 m² house in the Rhône (zone H1), 3-person household; “without Coup de pouce”: electric heaters replaced', ['l', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-air-eau',
  group: 'prix',
  order: 2,
  tool: 'simulateur',
  preset: { type: 'air_eau' },
  types: ['air_eau'],
  focus: 'rac',
  related: ['prix-pompe-a-chaleur', 'prime-cee-pompe-a-chaleur', 'maprimerenov-pompe-a-chaleur', 'consommation-pompe-a-chaleur', 'puissance-pompe-a-chaleur', 'remplacer-chaudiere-fioul'],
  sources: ['observatoire', 'spMpr', 'bar171', 'coupDePouce', 'ademe', 'emmy'],
  fr: {
    slug: 'pompe-a-chaleur-air-eau',
    nav: 'PAC air/eau',
    card: 'Prix médian, aides 2026 par couleur, rendement réel mesuré.',
    title: 'Pompe à chaleur air/eau 2026 : prix, aides et reste à charge',
    description: 'Pompe à chaleur air/eau en 2026 : prix médian des devis, MaPrimeRénov’, prime CEE Coup de pouce, reste à charge selon vos revenus et rendement réel mesuré.',
    h1: 'Pompe à chaleur air/eau : prix et reste à charge en 2026',
    intro: 'La PAC air/eau est la seule, avec la géothermie, à garder MaPrimeRénov’ en 2026. Voici ce qu’elle coûte chez vous, aides déduites.',
    resume: (h) => {
      const P = h.P, F = P.maprimerenov.forfaits.air_eau;
      return `Une pompe à chaleur air/eau capte la chaleur de l’air extérieur et la transmet à l’eau du circuit de chauffage central, radiateurs ou plancher chauffant, souvent aussi au ballon d’eau chaude. C’est l’équipement qui remplace le plus directement une chaudière au fioul ou au gaz. Son prix médian est de ${h.eur(P.prix_installation.air_eau.median_ttc)} TTC sur les devis publiés par l’observatoire ScoreSolaire, un échantillon encore réduit. En 2026, elle ouvre droit à MaPrimeRénov’ par geste (${h.eur(F.bleu)}, ${h.eur(F.jaune)} ou ${h.eur(F.violet)} selon les revenus, sur une dépense retenue de ${h.eur(F.plafond_depense)} au plus) et à la prime CEE de la fiche BAR-TH-171, multipliée par cinq quand elle remplace une chaudière fossile. Les deux aides sont plafonnées ensemble par l’écrêtement. Sur le terrain, l’ADEME a mesuré un rendement annuel moyen de ${h.num(P.rendements.scop.air_eau, 1)} : une PAC air/eau fournit près de trois kilowattheures de chaleur pour un kilowattheure d’électricité.`;
    },
    faqs: (h) => [
      { q: 'Peut-on garder ses anciens radiateurs avec une PAC air/eau ?', a: 'Souvent oui, avec une PAC moyenne ou haute température capable de chauffer l’eau à 55 ou 65 °C. Mais plus l’eau doit être chaude, plus le rendement baisse. Si les radiateurs sont petits ou si la maison est mal isolée, l’installateur peut proposer d’en remplacer quelques-uns : la note de dimensionnement exigée pour la prime CEE doit le justifier.' },
      { q: 'Quelle efficacité saisonnière exige la fiche CEE pour une PAC air/eau ?', a: `Au moins ${h.pct(h.P.cee.bar_th_171.etas_min_basse_temperature, 0)} pour une PAC basse température et ${h.pct(h.P.cee.bar_th_171.etas_min_moyenne_haute_temperature, 0)} pour une PAC moyenne ou haute température, mesurée selon le règlement européen d’écoconception. Au-delà de 140 %, la prime augmente d’environ 20 %. L’Etas figure sur la fiche produit et l’étiquette énergie : demandez-la avant de signer.` },
      { q: 'La PAC air/eau produit-elle aussi l’eau chaude ?', a: 'Oui si elle est équipée d’un ballon, intégré à l’unité intérieure ou séparé. Ce site ne chiffre que le chauffage : l’eau chaude ajoute une consommation, mais aussi une économie si elle était produite par la chaudière ou un cumulus électrique. Votre devis doit dire si le ballon est compris.' },
    ],
    body: (h) => `<h2>Le reste à charge selon vos revenus</h2>
<p>Pour une même maison, le reste à charge dépend surtout de la catégorie de revenus et du Coup de pouce. Le tableau applique le moteur du simulateur à quatre foyers de trois personnes, avec la prime CEE estimée au prix du registre Emmy :</p>
${parCouleur(h)}
<p>Le ménage bleu ne paie pas moins de ${h.pct(h.P.ecretement.reste_a_charge_min.bleu, 0)} de la dépense retenue, le jaune ${h.pct(h.P.ecretement.reste_a_charge_min.jaune, 0)}, le violet ${h.pct(h.P.ecretement.reste_a_charge_min.violet, 0)} : c’est l’effet de l’écrêtement, expliqué sur la page ${h.a('ecretement-maprimerenov', 'dédiée')}. Pour le ménage rose, seule la prime CEE joue.</p>
<h2>Basse ou haute température</h2>
<p>Une PAC basse température chauffe l’eau à 35 ou 45 °C : idéale sur un plancher chauffant ou de grands radiateurs, elle a le meilleur rendement. Une PAC haute température monte à 65 °C pour alimenter de vieux radiateurs en fonte, au prix d’une consommation plus forte. Le simulateur retient par défaut le rendement moyen mesuré par l’ADEME ; si votre installateur annonce un SCOP, saisissez-le dans « Affiner », en gardant à l’esprit que les mesures de terrain vont de ${h.num(h.P.rendements.scop.air_eau_min, 1)} à ${h.num(h.P.rendements.scop.air_eau_max, 1)}.</p>
<h2>Ce qu’un bon devis contient</h2>
<p>La marque, le modèle et sa puissance ; l’Etas ; la température de départ d’eau prévue ; le ballon d’eau chaude s’il y en a un ; la dépose de l’ancienne chaudière ; le montant de la prime CEE et le nom de l’entreprise qui la verse ; le numéro d’agrément du modèle si le Coup de pouce est appliqué ; la qualification RGE de l’installateur. La ${h.a('consommation-pompe-a-chaleur', 'consommation attendue')} et la ${h.a('puissance-pompe-a-chaleur', 'puissance')} se vérifient sur ce site.</p>`,
  },
  en: {
    slug: 'air-to-water-heat-pump-price',
    nav: 'Air-to-water heat pump',
    card: 'Median price, 2026 grants by colour, measured real efficiency.',
    title: 'Air-to-water heat pump France 2026: price, grants, net cost',
    description: 'Air-to-water heat pump in France in 2026: median quote price, MaPrimeRénov’, CEE Coup de pouce bonus, net cost by income band and real measured efficiency.',
    h1: 'Air-to-water heat pump: price and net cost in 2026',
    intro: 'Air-to-water and ground-source are the only heat pumps that keep MaPrimeRénov’ in 2026. Here is what one costs in your case, grants deducted.',
    resume: (h) => {
      const P = h.P, F = P.maprimerenov.forfaits.air_eau;
      return `An air-to-water heat pump draws heat from the outside air and passes it to the water in the central heating circuit, radiators or underfloor heating, and often to the hot-water cylinder too. It is the most direct replacement for an oil or gas boiler. Its median price is ${h.eur(P.prix_installation.air_eau.median_ttc)} including VAT across the quotes published by the ScoreSolaire observatory, a sample that is still small. In 2026 it qualifies for the per-item MaPrimeRénov’ (${h.eur(F.bleu)}, ${h.eur(F.jaune)} or ${h.eur(F.violet)} depending on income, on an eligible expense of at most ${h.eur(F.plafond_depense)}) and for the CEE bonus of sheet BAR-TH-171, multiplied by five when it replaces a fossil-fuel boiler. The two grants are capped together. In the field, ADEME measured an average yearly efficiency of ${h.num(P.rendements.scop.air_eau, 1)}: an air-to-water heat pump delivers nearly three kilowatt-hours of heat for one kilowatt-hour of electricity.`;
    },
    faqs: (h) => [
      { q: 'Can I keep my old radiators with an air-to-water heat pump?', a: 'Often yes, with a medium- or high-temperature heat pump able to heat water to 55 or 65 °C. But the hotter the water, the lower the efficiency. If the radiators are small or the house poorly insulated, the installer may suggest replacing a few: the sizing note required for the CEE bonus has to justify it.' },
      { q: 'What seasonal efficiency does the CEE sheet require for air-to-water?', a: `At least ${h.pct(h.P.cee.bar_th_171.etas_min_basse_temperature, 0)} for a low-temperature unit and ${h.pct(h.P.cee.bar_th_171.etas_min_moyenne_haute_temperature, 0)} for a medium- or high-temperature one, measured under the EU ecodesign regulation. Above 140%, the bonus rises by about 20%. The Etas appears on the product fiche and energy label: ask for it before signing.` },
      { q: 'Does an air-to-water heat pump also make hot water?', a: 'Yes, if it has a cylinder, built into the indoor unit or separate. This site only works out space heating: hot water adds consumption, but also a saving if it used to come from the boiler or an electric immersion tank. Your quote should say whether the cylinder is included.' },
    ],
    body: (h) => `<h2>Out-of-pocket cost by income</h2>
<p>For the same house, the out-of-pocket cost depends mainly on the income category and the Coup de pouce. The table runs the calculator’s engine for four three-person households, with the CEE bonus estimated at the Emmy registry price:</p>
${parCouleur(h)}
<p>A blue household pays no less than ${h.pct(h.P.ecretement.reste_a_charge_min.bleu, 0)} of the eligible expense, yellow ${h.pct(h.P.ecretement.reste_a_charge_min.jaune, 0)}, purple ${h.pct(h.P.ecretement.reste_a_charge_min.violet, 0)}: that is the effect of the cap, explained on its ${h.a('ecretement-maprimerenov', 'own page')}. For a pink household, only the CEE bonus counts.</p>
<h2>Low or high temperature</h2>
<p>A low-temperature heat pump heats water to 35 or 45 °C: ideal with underfloor heating or large radiators, it is the most efficient. A high-temperature unit reaches 65 °C to feed old cast-iron radiators, at the cost of higher consumption. The calculator uses ADEME’s measured average by default; if your installer quotes a SCOP, enter it under “Refine”, bearing in mind that field measurements range from ${h.num(h.P.rendements.scop.air_eau_min, 1)} to ${h.num(h.P.rendements.scop.air_eau_max, 1)}.</p>
<h2>What a good quote contains</h2>
<p>The make, model and output; the Etas; the planned flow temperature; the hot-water cylinder if any; removal of the old boiler; the CEE bonus amount and the company paying it; the model’s approval number if the Coup de pouce is applied; the installer’s RGE certification. The ${h.a('consommation-pompe-a-chaleur', 'expected consumption')} and the ${h.a('puissance-pompe-a-chaleur', 'output')} can be checked on this site.</p>`,
  },
});
