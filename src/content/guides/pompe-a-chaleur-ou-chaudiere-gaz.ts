import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Coût du kWh de chaleur utile par équipement (paramètres du site). */
const kwhUtile = (h: Helpers) => {
  const fr = h.lang === 'fr', E = h.P.energie, R = h.P.rendements;
  const rows: Array<[string, number, number]> = [
    [fr ? 'Chaudière gaz (rendement 86 %)' : 'Gas boiler (86% efficiency)', E.gaz.kwh_ttc, R.chaudiere_hypothese],
    [fr ? 'Chaudière fioul (rendement 86 %)' : 'Oil boiler (86% efficiency)', h.M.prixFioulKwh(), R.chaudiere_hypothese],
    [fr ? 'Radiateurs électriques' : 'Electric heaters', E.electricite.kwh_ttc, R.radiateur_electrique],
    [fr ? `PAC air/eau (rendement ${h.num(R.scop.air_eau, 1)})` : `Air-to-water heat pump (efficiency ${h.num(R.scop.air_eau, 1)})`, E.electricite.kwh_ttc, R.scop.air_eau],
    [fr ? `PAC géothermique (rendement ${h.num(R.scop.geo, 1)})` : `Ground-source heat pump (efficiency ${h.num(R.scop.geo, 1)})`, E.electricite.kwh_ttc, R.scop.geo],
  ];
  return h.table(fr ? ['Équipement', 'Prix du kWh acheté', 'Prix du kWh de chaleur'] : ['Equipment', 'Price per kWh bought', 'Price per kWh of heat'],
    rows.map(([n, p, r]) => [n, `${h.num(p, 4)} €`, `${h.num(p / r, 4)} €`]),
    fr ? `Gaz : Eurostat, ${h.periodeGaz} ; électricité : tarif bleu Base au ${h.dateElec} ; fioul : prix moyen France du Weekly Oil Bulletin, avec l’hypothèse de 10 kWh par litre` : `Gas: Eurostat, ${h.periodeGaz}; electricity: regulated Base tariff at ${h.dateElec}; oil: France average from the Weekly Oil Bulletin, assuming 10 kWh per litre`, ['l', 'r', 'r']);
};

const factures = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = ['13', '44', '69', '67', '25'].map((c) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, dep: c });
    return [h.dep(c).nom, h.eur(r.coutAvant), h.eur(r.coutPac), h.eur(r.economie)];
  });
  return h.table(fr ? ['Département', 'Chaudière gaz', 'PAC air/eau', 'Écart par an'] : ['Département', 'Gas boiler', 'Air-to-water', 'Yearly gap'], rows,
    fr ? 'Facture de chauffage annuelle hors abonnement, maison de 100 m² à isolation moyenne ; DJU 2015-2024' : 'Yearly heating bill excluding standing charges, averagely insulated 100 m² house; HDD 2015-2024', ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-ou-chaudiere-gaz',
  group: 'usage',
  order: 3,
  mini: 'gaz',
  related: ['rentabilite-pompe-a-chaleur', 'consommation-pompe-a-chaleur', 'coup-de-pouce-chauffage', 'prix-pompe-a-chaleur', 'renovation-ampleur'],
  sources: ['eurostatGaz', 'cre', 'ademe', 'ecodesign', 'tva', 'coupDePouce'],
  fr: {
    slug: 'pompe-a-chaleur-ou-chaudiere-gaz',
    nav: 'PAC ou chaudière gaz',
    card: 'Prix du kWh de chaleur, facture annuelle, aides et TVA comparés.',
    title: 'Pompe à chaleur ou chaudière gaz : facture et coût comparés',
    description: 'Pompe à chaleur ou chaudière gaz en 2026 : prix du kWh de chaleur, facture annuelle par département, aides, TVA à 5,5 % contre 20 %, ce qui fait pencher.',
    h1: 'Pompe à chaleur ou chaudière gaz : la comparaison chiffrée',
    intro: 'Votre chaudière gaz arrive en fin de vie. La remplacer à l’identique ou passer à la PAC ? Voici l’écart de facture et d’investissement, avec les chiffres du jour.',
    resume: (h) => {
      const E = h.P.energie, R = h.P.rendements;
      return `Une chaudière au gaz neuve transforme au mieux environ ${h.pct(R.chaudiere_hypothese, 0)} de l’énergie du gaz en chaleur, le minimum imposé par le règlement européen d’écoconception ; une pompe à chaleur air/eau produit en moyenne ${h.num(R.scop.air_eau, 1)} kWh de chaleur par kWh d’électricité, d’après les mesures de l’ADEME. Le kWh d’électricité coûte ${h.num(E.electricite.kwh_ttc, 4)} € au tarif bleu, le kWh de gaz ${h.num(E.gaz.kwh_ttc, 4)} € en moyenne d’après Eurostat. Ramené à la chaleur produite, le gaz revient à ${h.num(E.gaz.kwh_ttc / R.chaudiere_hypothese, 4)} € le kWh et la PAC à ${h.num(E.electricite.kwh_ttc / R.scop.air_eau, 4)} €. La PAC coûte donc moins cher à l’usage, d’autant plus que le climat est froid, et permet de résilier l’abonnement au gaz. Mais elle coûte plus cher à l’achat : la PAC bénéficie de la TVA à ${h.pct(h.P.tva.pac, 1)}, de MaPrimeRénov’ et de la prime CEE avec Coup de pouce, alors qu’une chaudière gaz paie ${h.pct(h.P.tva.chaudiere_fossile, 0)} de TVA et n’est pas financée par MaPrimeRénov’. Le choix tient à l’écart entre les deux investissements, comparé à l’économie annuelle.`;
    },
    faqs: (h) => [
      { q: 'Peut-on encore installer une chaudière gaz neuve en 2026 ?', a: 'Oui, dans une maison existante, le remplacement d’une chaudière gaz par une autre reste autorisé. Mais elle n’est pas financée par MaPrimeRénov’, sa pose est taxée à 20 %, et depuis le 1er septembre 2026 une maison qui garde le gaz ne peut plus être financée en rénovation d’ampleur. Dans les logements neufs, la réglementation environnementale RE2020 l’exclut en pratique.' },
      { q: 'Une PAC hybride est-elle un bon compromis ?', a: 'Une PAC hybride associe une petite pompe à chaleur et une chaudière gaz qui prend le relais par grand froid. Elle coûte moins cher qu’une PAC seule dans une maison mal isolée. Mais elle garde l’abonnement au gaz et, depuis le 1er septembre 2026, elle n’est plus finançable en rénovation d’ampleur. Le simulateur ne la chiffre pas.' },
      { q: 'Faut-il garder l’abonnement gaz après une PAC ?', a: 'Seulement si le gaz sert encore, pour la cuisson par exemple. Sinon, résilier l’abonnement supprime un coût fixe annuel que le calcul du site ne compte pas, ce qui améliore l’intérêt de la PAC. Le compteur peut être gardé ou déposé ; renseignez-vous auprès de votre fournisseur et du gestionnaire de réseau.' },
    ],
    body: (h) => `<h2>Le prix du kWh de chaleur</h2>
${kwhUtile(h)}
<p>Un « kWh de chaleur » est l’énergie qui arrive vraiment dans les pièces. C’est la seule unité qui permet de comparer des équipements qui n’utilisent pas la même énergie. Le rendement de 86 % est une hypothèse prudente : c’est le minimum réglementaire pour une chaudière neuve, et une vieille chaudière fait souvent moins bien.</p>
<h2>La facture annuelle selon le climat</h2>
${factures(h)}
<!--mini:gaz-->
<h2>L’investissement</h2>
<p>Aucune source ouverte ne publie de prix moyen de chaudière gaz. Pour la PAC air/eau, la médiane des devis publiés par l’observatoire des prix est de ${h.eur(h.P.prix_installation.air_eau.median_ttc)}, sur un petit échantillon. Les aides la réduisent fortement : prime CEE avec Coup de pouce (une chaudière gaz remplacée y donne droit), MaPrimeRénov’ pour les ménages bleus, jaunes et violets. Demandez deux devis, l’un pour une chaudière, l’autre pour une PAC, et saisissez le second dans le simulateur : il donne le reste à charge et le temps de retour.</p>
<h2>Les critères qui font pencher</h2>
<p>Pour la PAC : un climat froid, une maison correctement isolée, des radiateurs à basse température ou un plancher chauffant, des aides élevées, l’envie de supprimer l’abonnement au gaz. Pour la chaudière : une maison très mal isolée avec des radiateurs à haute température, un budget serré sans aide, un climat très doux où l’économie est faible. Dans ce dernier cas, isoler d’abord est souvent le meilleur placement.</p>`,
  },
  en: {
    slug: 'heat-pump-vs-gas-boiler',
    nav: 'Heat pump vs gas boiler',
    card: 'Price per kWh of heat, yearly bill, grants and VAT compared.',
    title: 'Heat pump vs gas boiler in France: running costs compared',
    description: 'Heat pump or gas boiler in France in 2026: price per kWh of heat, yearly bill by département, grants, 5.5% VAT against 20%, and what tips the balance.',
    h1: 'Heat pump or gas boiler: the figures side by side',
    intro: 'Your gas boiler is nearing the end of its life. Replace it like for like or switch to a heat pump? Here is the gap in bills and outlay, with current figures.',
    resume: (h) => {
      const E = h.P.energie, R = h.P.rendements;
      return `A new gas boiler turns at best about ${h.pct(R.chaudiere_hypothese, 0)} of the gas’s energy into heat, the minimum set by the EU ecodesign regulation; an air-to-water heat pump produces on average ${h.num(R.scop.air_eau, 1)} kWh of heat per kWh of electricity, according to ADEME’s measurements. Electricity costs €${h.num(E.electricite.kwh_ttc, 4)} per kWh at the regulated tariff, gas €${h.num(E.gaz.kwh_ttc, 4)} on average according to Eurostat. Per kWh of heat produced, gas comes to €${h.num(E.gaz.kwh_ttc / R.chaudiere_hypothese, 4)} and the heat pump to €${h.num(E.electricite.kwh_ttc / R.scop.air_eau, 4)}. The heat pump is therefore cheaper to run, all the more so in a cold climate, and lets you cancel the gas subscription. But it costs more to buy: the heat pump gets ${h.pct(h.P.tva.pac, 1)} VAT, MaPrimeRénov’ and the CEE bonus with Coup de pouce, while a gas boiler pays ${h.pct(h.P.tva.chaudiere_fossile, 0)} VAT and is not funded by MaPrimeRénov’. The choice comes down to the gap between the two outlays, compared with the yearly saving.`;
    },
    faqs: (h) => [
      { q: 'Can I still install a new gas boiler in 2026?', a: 'Yes, in an existing house, replacing one gas boiler with another is still allowed. But it is not funded by MaPrimeRénov’, its fitting is taxed at 20%, and since 1 September 2026 a house that keeps gas can no longer be funded under whole-home renovation. In new homes, the RE2020 environmental regulation rules it out in practice.' },
      { q: 'Is a hybrid heat pump a good compromise?', a: 'A hybrid heat pump pairs a small heat pump with a gas boiler that takes over in hard frosts. It costs less than a standalone heat pump in a poorly insulated house. But it keeps the gas subscription and, since 1 September 2026, can no longer be funded under whole-home renovation. The calculator does not cost it.' },
      { q: 'Should I keep the gas subscription after a heat pump?', a: 'Only if gas is still used, for cooking for example. Otherwise, cancelling the subscription removes a fixed yearly cost that the site’s calculation does not count, which improves the heat pump’s case. The meter can be kept or removed; ask your supplier and the network operator.' },
    ],
    body: (h) => `<h2>The price per kWh of heat</h2>
${kwhUtile(h)}
<p>A “kWh of heat” is the energy that actually reaches the rooms. It is the only unit that lets you compare equipment using different energies. The 86% efficiency is a cautious assumption: it is the regulatory minimum for a new boiler, and an old boiler often does worse.</p>
<h2>The yearly bill by climate</h2>
${factures(h)}
<!--mini:gaz-->
<h2>The outlay</h2>
<p>No open source publishes an average gas boiler price. For an air-to-water heat pump, the median of quotes published by the price observatory is ${h.eur(h.P.prix_installation.air_eau.median_ttc)}, on a small sample. Grants cut it sharply: the CEE bonus with Coup de pouce (replacing a gas boiler qualifies), and MaPrimeRénov’ for blue, yellow and purple households. Get two quotes, one for a boiler and one for a heat pump, and enter the second in the calculator: it gives the out-of-pocket cost and payback.</p>
<h2>What tips the balance</h2>
<p>For the heat pump: a cold climate, a reasonably insulated house, low-temperature radiators or underfloor heating, high grants, a wish to drop the gas subscription. For the boiler: a very poorly insulated house with high-temperature radiators, a tight budget with no grant, a very mild climate where the saving is small. In that last case, insulating first is often the best investment.</p>`,
  },
});
