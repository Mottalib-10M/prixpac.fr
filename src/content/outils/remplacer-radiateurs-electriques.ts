import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Économie annuelle radiateurs → PAC air/air selon le département et la surface (moteur du site). */
const eco = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = ['13', '33', '69', '75', '67'].map((c) => {
    const cells = [50, 80, 120].map((s) => h.eur(h.M.simuler({ ...h.M.DEFAUT, dep: c, energie: 'elec', type: 'air_air', surface: s, logement: s < 80 ? 'appartement' : 'maison' }).economie));
    return [h.dep(c).nom, ...cells];
  });
  return h.table(fr ? ['Département', '50 m²', '80 m²', '120 m²'] : ['Département', '50 m²', '80 m²', '120 m²'], rows,
    fr ? `Économie annuelle estimée en remplaçant des radiateurs électriques par une PAC air/air (rendement supposé de ${h.num(h.P.rendements.scop.air_air_hypothese, 1)}), isolation moyenne, tarif bleu Base ; hors abonnement` : `Estimated yearly saving replacing electric heaters with an air-to-air heat pump (assumed efficiency ${h.num(h.P.rendements.scop.air_air_hypothese, 1)}), average insulation, regulated Base tariff; standing charge excluded`, ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'remplacer-radiateurs-electriques',
  group: 'usage',
  order: 5,
  tool: 'simulateur',
  preset: { energie: 'elec', type: 'air_air' },
  focus: 'eco',
  related: ['pompe-a-chaleur-air-air', 'pompe-a-chaleur-appartement', 'consommation-pompe-a-chaleur', 'rentabilite-pompe-a-chaleur', 'pompe-a-chaleur-air-eau'],
  sources: ['observatoire', 'cre', 'bar171', 'tva'],
  fr: {
    slug: 'remplacer-radiateurs-electriques',
    nav: 'Remplacer des radiateurs électriques',
    card: 'Air/air ou air/eau après des « grille-pain » : économie et aides réelles.',
    title: 'Remplacer ses radiateurs électriques par une PAC : économie',
    description: 'Remplacer des radiateurs électriques par une pompe à chaleur : économie annuelle selon le climat, air/air ou air/eau, aides 2026 sans Coup de pouce, prix au kW.',
    h1: 'Remplacer des radiateurs électriques par une pompe à chaleur',
    intro: 'Le simulateur part de radiateurs électriques et d’une PAC air/air. L’électricité reste la même, mais chaque kWh produit environ trois fois plus de chaleur.',
    resume: (h) => {
      const r = h.M.simuler({ ...h.M.DEFAUT, energie: 'elec', type: 'air_air' });
      return `Un radiateur électrique transforme un kWh d’électricité en un kWh de chaleur ; une pompe à chaleur en produit plusieurs. En remplaçant des radiateurs par une PAC, on divise donc la consommation de chauffage par son rendement, sans changer d’énergie ni de contrat. Deux solutions existent. La PAC air/air, avec une unité extérieure et des unités murales dans les pièces, est la plus simple et la moins chère : la médiane des ${h.num(h.P.prix_installation.air_air.n)} devis publiés par l’observatoire des prix est de ${h.eur(h.P.prix_installation.air_air.median_ttc)}. Elle n’a pas de MaPrimeRénov’ en 2026, et sa prime CEE (fiche BAR-TH-129) n’est pas chiffrée par ce site ; elle bénéficie de la TVA à ${h.pct(h.P.tva.pac, 1)} sous conditions. La PAC air/eau suppose de créer un réseau de radiateurs à eau, ce qui coûte bien plus cher, mais ouvre droit à MaPrimeRénov’ et à la prime CEE de base. Le Coup de pouce, réservé au remplacement d’une chaudière fossile, ne s’applique dans aucun des deux cas. Pour une maison de 100 m² dans le Rhône, l’économie est d’environ ${h.eur(r.economie)} par an en air/air, avec un rendement supposé de ${h.num(h.P.rendements.scop.air_air_hypothese, 1)}.`;
    },
    faqs: (h) => [
      { q: 'Une PAC air/air chauffe-t-elle toute la maison ?', a: 'Une unité murale chauffe bien la pièce où elle se trouve et les pièces ouvertes sur elle. Pour les chambres, il faut une unité par pièce (système multisplit) ou garder quelques radiateurs. Le prix augmente avec le nombre d’unités intérieures : comparez des devis pour le même nombre de pièces chauffées.' },
      { q: 'Pourquoi le site suppose-t-il un rendement de 2,9 pour l’air/air ?', a: 'L’étude de terrain de l’ADEME porte sur les PAC air/eau et géothermiques. Faute de mesure équivalente pour l’air/air, le site retient la même valeur que l’air/eau, présentée comme une hypothèse. Les fabricants annoncent souvent des rendements saisonniers plus élevés ; vous pouvez saisir celui de votre devis dans « Affiner ».' },
      { q: 'La climatisation l’été fait-elle grimper la facture ?', a: 'Une PAC air/air réversible peut rafraîchir en été, ce qui ajoute une consommation que le calcul du site ne compte pas. Elle reste modeste dans la plupart des régions si la consigne est raisonnable, autour de 26 °C. L’économie annoncée par le simulateur porte sur le chauffage seul.' },
    ],
    body: (h) => `<h2>L’économie selon la surface et le climat</h2>
${eco(h)}
<p>L’économie est proportionnelle au chauffage consommé : elle augmente des deux tiers entre Marseille et Strasbourg. En appartement, choisissez une isolation « bonne » si vous avez des voisins au-dessus et en dessous, ou saisissez votre consommation réelle de chauffage dans « Affiner ».</p>
<h2>Air/air ou air/eau</h2>
<p>L’air/air est la solution courante quand il n’y a pas de radiateurs à eau : pose en une ou deux journées, prix médian de ${h.eur(h.P.prix_installation.air_air.eur_par_kw)} par kW installé sur les devis publiés, et climatisation possible. L’air/eau demande de poser des tuyaux et des radiateurs dans toutes les pièces : c’est un chantier lourd, qui se justifie surtout lors d’une rénovation complète. Elle donne droit à MaPrimeRénov’ et à la prime CEE de la fiche BAR-TH-171, sans Coup de pouce.</p>
<h2>Isoler d’abord ?</h2>
<p>Les logements chauffés à l’électricité directe sont souvent des constructions des années 1970 à 2000, parfois mal isolées. Isoler les combles et changer les fenêtres réduit la facture quel que soit le chauffage, et permet de choisir une PAC plus petite. Voir ${h.a('renovation-ampleur', 'rénovation d’ampleur')} si vous prévoyez un projet complet.</p>`,
  },
  en: {
    slug: 'replacing-electric-heaters',
    nav: 'Replacing electric heaters',
    card: 'Air-to-air or air-to-water after panel heaters: real saving and grants.',
    title: 'Replacing electric heaters with a heat pump: the real saving',
    description: 'Replacing electric heaters with a heat pump in France: yearly saving by climate, air-to-air or air-to-water, 2026 grants (no Coup de pouce), price per kW.',
    h1: 'Replacing electric heaters with a heat pump',
    intro: 'The calculator starts from electric heaters and an air-to-air heat pump. The electricity stays the same, but each kWh produces about three times as much heat.',
    resume: (h) => {
      const r = h.M.simuler({ ...h.M.DEFAUT, energie: 'elec', type: 'air_air' });
      return `An electric heater turns one kWh of electricity into one kWh of heat; a heat pump produces several. Replacing heaters with a heat pump therefore divides heating consumption by its efficiency, with no change of energy or contract. There are two options. An air-to-air heat pump, with an outdoor unit and wall units in the rooms, is the simplest and cheapest: the median of the ${h.num(h.P.prix_installation.air_air.n)} quotes published by the price observatory is ${h.eur(h.P.prix_installation.air_air.median_ttc)}. It has no MaPrimeRénov’ in 2026, and its CEE bonus (sheet BAR-TH-129) is not calculated by this site; it gets ${h.pct(h.P.tva.pac, 1)} VAT under conditions. An air-to-water heat pump means creating a network of water radiators, which costs far more, but qualifies for MaPrimeRénov’ and the basic CEE bonus. The Coup de pouce, reserved for replacing a fossil boiler, applies in neither case. For a 100 m² house in the Rhône, the saving is about ${h.eur(r.economie)} a year with air-to-air, at an assumed efficiency of ${h.num(h.P.rendements.scop.air_air_hypothese, 1)}.`;
    },
    faqs: (h) => [
      { q: 'Does an air-to-air heat pump heat the whole house?', a: 'A wall unit heats its own room and rooms open onto it well. For bedrooms you need one unit per room (a multi-split system) or to keep a few heaters. The price rises with the number of indoor units: compare quotes for the same number of heated rooms.' },
      { q: 'Why does the site assume an efficiency of 2.9 for air-to-air?', a: 'ADEME’s field study covers air-to-water and ground-source heat pumps. Lacking an equivalent measurement for air-to-air, the site uses the same value as air-to-water, presented as an assumption. Manufacturers often claim higher seasonal efficiencies; you can enter the one on your quote under “Refine”.' },
      { q: 'Does summer cooling push the bill up?', a: 'A reversible air-to-air heat pump can cool in summer, which adds consumption the site’s calculation does not count. It stays modest in most regions if the setting is reasonable, around 26 °C. The saving shown by the calculator covers heating only.' },
    ],
    body: (h) => `<h2>The saving by area and climate</h2>
${eco(h)}
<p>The saving is proportional to the heating used: it rises by two thirds between Marseille and Strasbourg. In a flat, choose “good” insulation if you have neighbours above and below, or enter your real heating consumption under “Refine”.</p>
<h2>Air-to-air or air-to-water</h2>
<p>Air-to-air is the usual choice when there are no water radiators: fitted in one or two days, a median of ${h.eur(h.P.prix_installation.air_air.eur_par_kw)} per kW installed across published quotes, and cooling as an option. Air-to-water means laying pipes and radiators in every room: a heavy job, mostly justified in a full renovation. It qualifies for MaPrimeRénov’ and the CEE bonus under sheet BAR-TH-171, without the Coup de pouce.</p>
<h2>Insulate first?</h2>
<p>Homes with direct electric heating are often built between the 1970s and 2000s, sometimes poorly insulated. Insulating the loft and replacing windows lowers the bill whatever the heating, and lets you choose a smaller heat pump. See ${h.a('renovation-ampleur', 'whole-home renovation')} if you are planning a full project.</p>`,
  },
});
