import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Prime CEE BAR-TH-171 appartement selon la surface et la zone (moteur du site). */
const grille = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const cas: Array<[number, string]> = [[30, fr ? 'moins de 35 m²' : 'under 35 m²'], [50, fr ? '35 à 59 m²' : '35 to 59 m²'], [75, fr ? '60 m² et plus' : '60 m² and over']];
  const rows = cas.map(([s, lab]) => [lab, ...(['H1', 'H2', 'H3'] as const).map((z) => {
    const c = h.M.cee({ type: 'air_eau', logement: 'appartement', surface: s, zone: z, etasHaut: false, coupDePouce: true, couleur: 'violet' });
    return `${h.num(c.kwhc)} (${h.eur(c.eur)})`;
  })]);
  return h.table(fr ? ['Surface chauffée', 'Zone H1', 'Zone H2', 'Zone H3'] : ['Heated area', 'Zone H1', 'Zone H2', 'Zone H3'], rows,
    fr ? `kWh cumac avec Coup de pouce (et valeur au prix moyen Emmy classique de ${h.moisCee}), PAC air/eau en appartement, efficacité de 111 à 140 %` : `kWh cumac with Coup de pouce (and value at the ${h.moisCee} Emmy standard average price), air-to-water heat pump in a flat, efficiency 111 to 140%`, ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-appartement',
  group: 'prix',
  order: 6,
  tool: 'simulateur',
  preset: { logement: 'appartement', surface: 60 },
  focus: 'rac',
  related: ['pompe-a-chaleur-air-air', 'pompe-a-chaleur-air-eau', 'prime-cee-pompe-a-chaleur', 'remplacer-radiateurs-electriques', 'puissance-pompe-a-chaleur'],
  sources: ['bar171', 'spMpr', 'coupDePouce', 'emmy', 'observatoire'],
  fr: {
    slug: 'pompe-a-chaleur-appartement',
    nav: 'PAC en appartement',
    card: 'Air/air ou air/eau, copropriété, aides et prime CEE propres à l’appartement.',
    title: 'Pompe à chaleur appartement 2026 : aides et copropriété',
    description: 'Pompe à chaleur en appartement en 2026 : air/air ou air/eau, accord de la copropriété, MaPrimeRénov’, prime CEE BAR-TH-171 appartement et reste à charge.',
    h1: 'Pompe à chaleur en appartement : ce qui change',
    intro: 'En appartement, la surface est petite, l’unité extérieure se pose sur une façade commune et la prime CEE suit un barème propre. Le simulateur part de 60 m².',
    resume: (h) => {
      const A = h.P.cee.bar_th_171.appartement;
      return `Une pompe à chaleur individuelle en appartement est possible, mais l’unité extérieure se pose sur un balcon, une terrasse ou une façade, souvent parties communes ou modifiant l’aspect extérieur : il faut en général l’autorisation de l’assemblée générale de copropriété, et respecter le règlement et le bruit pour les voisins. Le choix dépend du chauffage existant. Avec un chauffage central individuel au gaz, une PAC air/eau peut reprendre les radiateurs à eau ; elle ouvre droit à MaPrimeRénov’ (jusqu’à ${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu)}) et à la prime CEE de la fiche BAR-TH-171 version appartement : ${h.num(A.etas_bas)} kWh cumac de base, réduits de moitié sous 35 m² et de 30 % de 35 à 59 m². Avec des radiateurs électriques, la solution courante est la PAC air/air, plus simple à poser, sans MaPrimeRénov’ en 2026. La géothermie individuelle est hors de portée en appartement. Le simulateur chiffre l’air/eau et la consommation de l’air/air ; la prime CEE de l’air/air (fiche BAR-TH-129) n’est pas chiffrée ici.`;
    },
    faqs: (h) => [
      { q: 'Faut-il l’accord de la copropriété pour une pompe à chaleur ?', a: 'Presque toujours. L’unité extérieure touche à l’aspect extérieur de l’immeuble ou s’installe sur une partie commune ou à usage privatif, comme un balcon. Ces travaux relèvent d’un vote de l’assemblée générale. Lisez aussi le règlement de copropriété, et prévoyez l’emplacement pour limiter le bruit chez les voisins : un trouble anormal peut être sanctionné même après autorisation.' },
      { q: 'La prime CEE est-elle plus faible en appartement ?', a: `Oui : la fiche BAR-TH-171 prévoit ${h.num(h.P.cee.bar_th_171.appartement.etas_bas)} kWh cumac pour un appartement, contre ${h.num(h.P.cee.bar_th_171.maison.etas_bas)} pour une maison, et les paliers de surface sont plus bas (35 et 60 m²). Avec le Coup de pouce, qui multiplie le volume par ${h.num(h.P.cee.coup_de_pouce.coefficient)}, la prime reste significative si la PAC remplace une chaudière au gaz ou au fioul.` },
      { q: 'Peut-on avoir MaPrimeRénov’ pour une PAC air/air en appartement ?', a: 'Non, la PAC air/air n’est pas financée par MaPrimeRénov’ par geste en 2026, en maison comme en appartement. Elle peut ouvrir droit à une prime CEE (fiche BAR-TH-129) et bénéficie de la TVA à 5,5 % dans un logement de plus de deux ans sous conditions de performance. Le simulateur ne chiffre pas cette prime CEE.' },
    ],
    body: (h) => `<h2>La prime CEE en appartement</h2>
<p>Pour une PAC air/eau qui remplace une chaudière au gaz, voici le volume de la fiche BAR-TH-171 appartement avec Coup de pouce, et sa valeur au prix moyen du registre :</p>
${grille(h)}
<p>Un ménage bleu ou jaune revend ses certificats au prix « précarité », plus élevé (${h.num(h.P.cee.prix_mwh.precarite, 2)} € le MWh cumac contre ${h.num(h.P.cee.prix_mwh.classique, 2)}). Ce sont des valeurs de marché : chaque fournisseur fixe son propre prix.</p>
<h2>Air/eau ou air/air ?</h2>
<p>L’air/eau remplace une chaudière et garde les radiateurs à eau et souvent l’eau chaude ; elle est aidée par MaPrimeRénov’ et la prime CEE, mais coûte plus cher (médiane de ${h.eur(h.P.prix_installation.air_eau.median_ttc)} sur les devis publiés, surtout des maisons). L’air/air souffle de l’air chaud par des unités murales, remplace des radiateurs électriques et climatise l’été ; elle coûte moins cher (médiane de ${h.eur(h.P.prix_installation.air_air.median_ttc)}), sans MaPrimeRénov’. Dans un appartement chauffé à l’électricité, l’air/air est le cas courant : voir ${h.a('remplacer-radiateurs-electriques', 'remplacer des radiateurs électriques')}.</p>
<h2>Un besoin de chauffage plus faible</h2>
<p>Un appartement perd moins de chaleur qu’une maison de même surface : il a des voisins au-dessus, en dessous et sur les côtés. Le simulateur ne le sait pas ; choisissez une isolation « bonne » si vous êtes en étage intermédiaire, ou saisissez votre consommation réelle dans « Affiner ». La puissance nécessaire est souvent de 3 à 5 kW, ce qui limite le prix, mais aussi l’économie annuelle et donc l’intérêt financier d’une PAC air/eau.</p>
<h2>Chauffage collectif</h2>
<p>Si l’immeuble a une chaufferie collective, le changement d’énergie se décide en assemblée générale pour tout l’immeuble, avec d’autres aides (MaPrimeRénov’ Copropriété, fiches CEE collectives). Ce site ne chiffre que les installations individuelles.</p>`,
  },
  en: {
    slug: 'heat-pump-flat',
    nav: 'Heat pump in a flat',
    card: 'Air-to-air or air-to-water, co-ownership rules, flat-specific grants and CEE.',
    title: 'Heat pump in a flat in France 2026: grants and co-ownership',
    description: 'Heat pump in a flat in France in 2026: air-to-air or air-to-water, co-ownership approval, MaPrimeRénov’, the CEE bonus from sheet BAR-TH-171 for flats, cost.',
    h1: 'Heat pump in a flat: what changes',
    intro: 'In a flat, the area is small, the outdoor unit goes on a shared façade and the CEE bonus follows its own scale. The calculator starts from 60 m².',
    resume: (h) => {
      const A = h.P.cee.bar_th_171.appartement;
      return `An individual heat pump in a flat is possible, but the outdoor unit goes on a balcony, terrace or façade, often common parts or changing the building’s outward look: the co-owners’ general meeting usually has to approve it, and the building rules and the neighbours’ peace must be respected. The choice depends on the existing heating. With individual gas central heating, an air-to-water heat pump can take over the water radiators; it qualifies for MaPrimeRénov’ (up to ${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu)}) and for the CEE bonus of sheet BAR-TH-171 for flats: ${h.num(A.etas_bas)} kWh cumac base, halved under 35 m² and cut by 30% from 35 to 59 m². With electric heaters, the usual answer is an air-to-air heat pump, simpler to fit, with no MaPrimeRénov’ in 2026. Individual ground-source heating is out of reach in a flat. The calculator costs air-to-water and air-to-air running costs; the air-to-air CEE bonus (sheet BAR-TH-129) is not calculated here.`;
    },
    faqs: (h) => [
      { q: 'Do the co-owners have to approve a heat pump?', a: 'Almost always. The outdoor unit changes the building’s outward look or sits on a common part or one for private use, such as a balcony. Such work needs a vote of the general meeting. Also read the building rules, and plan the position to limit noise for neighbours: an abnormal nuisance can be penalised even after approval.' },
      { q: 'Is the CEE bonus lower in a flat?', a: `Yes: sheet BAR-TH-171 sets ${h.num(h.P.cee.bar_th_171.appartement.etas_bas)} kWh cumac for a flat, against ${h.num(h.P.cee.bar_th_171.maison.etas_bas)} for a house, and the area bands are lower (35 and 60 m²). With the Coup de pouce, which multiplies the volume by ${h.num(h.P.cee.coup_de_pouce.coefficient)}, the bonus remains significant if the heat pump replaces a gas or oil boiler.` },
      { q: 'Can I get MaPrimeRénov’ for an air-to-air heat pump in a flat?', a: 'No, air-to-air heat pumps are not funded by per-item MaPrimeRénov’ in 2026, in houses or flats. They may qualify for a CEE bonus (sheet BAR-TH-129) and get 5.5% VAT in a home over two years old if performance conditions are met. The calculator does not work out that CEE bonus.' },
    ],
    body: (h) => `<h2>The CEE bonus in a flat</h2>
<p>For an air-to-water heat pump replacing a gas boiler, here is the volume under sheet BAR-TH-171 for flats with Coup de pouce, and its value at the registry average price:</p>
${grille(h)}
<p>A blue or yellow household sells its certificates at the higher “fuel poverty” price (€${h.num(h.P.cee.prix_mwh.precarite, 2)} per MWh cumac against €${h.num(h.P.cee.prix_mwh.classique, 2)}). These are market values: each supplier sets its own price.</p>
<h2>Air-to-water or air-to-air?</h2>
<p>Air-to-water replaces a boiler and keeps the water radiators and often hot water; it gets MaPrimeRénov’ and the CEE bonus, but costs more (median ${h.eur(h.P.prix_installation.air_eau.median_ttc)} across published quotes, mostly houses). Air-to-air blows warm air through wall units, replaces electric heaters and cools in summer; it costs less (median ${h.eur(h.P.prix_installation.air_air.median_ttc)}), without MaPrimeRénov’. In an electrically heated flat, air-to-air is the usual case: see ${h.a('remplacer-radiateurs-electriques', 'replacing electric heaters')}.</p>
<h2>Lower heating needs</h2>
<p>A flat loses less heat than a house of the same area: it has neighbours above, below and to the sides. The calculator cannot know this; choose “good” insulation if you are on a middle floor, or enter your real consumption under “Refine”. The output needed is often 3 to 5 kW, which keeps the price down, but also the yearly saving and so the financial case for air-to-water.</p>
<h2>Shared heating</h2>
<p>If the building has a shared boiler room, switching energy is decided at the general meeting for the whole building, with other grants (MaPrimeRénov’ Copropriété, collective CEE sheets). This site only costs individual installations.</p>`,
  },
});
