import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Économie annuelle pour quelques consommations de fioul (paramètres du site). */
const litres = (h: Helpers) => {
  const fr = h.lang === 'fr', E = h.P.energie, R = h.P.rendements;
  const prixL = E.fioul.eur_1000l_ttc / 1000;
  const rows = [1000, 1500, 2000, 2500, 3000].map((l) => {
    const chaleur = h.M.litresEnKwh(l) * R.chaudiere_hypothese, ae = (chaleur / R.scop.air_eau) * E.electricite.kwh_ttc, ge = (chaleur / R.scop.geo) * E.electricite.kwh_ttc;
    return [h.num(l), h.eur(l * prixL), h.eur(ae), h.eur(l * prixL - ae), h.eur(l * prixL - ge)];
  });
  return h.table(fr ? ['Litres de fioul par an', 'Facture fioul', 'Électricité PAC air/eau', 'Économie air/eau', 'Économie géothermie'] : ['Litres of oil per year', 'Oil bill', 'Air-to-water electricity', 'Air-to-water saving', 'Ground-source saving'], rows,
    fr ? `Fioul à ${h.num(prixL, 3)} € le litre (moyenne France du ${h.date(E.fioul.date)}, Weekly Oil Bulletin) ; hypothèse de 10 kWh par litre et rendement de chaudière de 86 % ; électricité au tarif bleu Base` : `Oil at €${h.num(prixL, 3)} per litre (France average on ${h.date(E.fioul.date)}, Weekly Oil Bulletin); assumes 10 kWh per litre and 86% boiler efficiency; electricity at the regulated Base tariff`, ['r', 'r', 'r', 'r', 'r']);
};

/** Litres de fioul et économie selon le climat (moteur du site, maison de 100 m²). */
const climatFioul = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = ['83', '33', '69', '67', '25'].map((c) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, dep: c, energie: 'fioul' }), d = h.dep(c);
    return [`${d.nom} (${h.num(d.dju)} DJU)`, h.num(Math.round(r.consoAvant / h.P.energie.fioul.kwh_par_litre_hypothese / 10) * 10), h.eur(r.coutAvant), h.eur(r.economie)];
  });
  return h.table(fr ? ['Département', 'Litres par an', 'Facture fioul', 'Économie air/eau'] : ['Département', 'Litres a year', 'Oil bill', 'Air-to-water saving'], rows,
    fr ? 'Maison de 100 m² à isolation moyenne ; degrés-jours Météo-France 2015-2024 ; mêmes hypothèses que le tableau précédent' : 'Averagely insulated 100 m² house; Météo-France degree-days 2015-2024; same assumptions as the previous table', ['l', 'r', 'r', 'r']);
};
/** Sensibilité de l'économie aux prix du fioul et de l'électricité (2 000 litres par an). */
const sensibilite = (h: Helpers) => {
  const fr = h.lang === 'fr', E = h.P.energie, R = h.P.rendements;
  const chaleur = h.M.litresEnKwh(2000) * R.chaudiere_hypothese, prixL = E.fioul.eur_1000l_ttc / 1000;
  const rows = [0.8, 1, 1.2].map((k) => {
    const fioul = 2000 * prixL * k, pac = (x: number) => (chaleur / R.scop.air_eau) * E.electricite.kwh_ttc * x;
    return [`${h.num(prixL * k, 2)} €`, h.eur(fioul - pac(1)), h.eur(fioul - pac(1.2))];
  });
  return h.table(fr ? ['Prix du litre de fioul', 'Économie, électricité au tarif actuel', 'Économie, électricité +20 %'] : ['Oil price per litre', 'Saving, electricity at today’s tariff', 'Saving, electricity +20%'], rows,
    fr ? 'Maison qui achète 2 000 litres par an, PAC air/eau ; prix du fioul à −20 %, au niveau actuel et à +20 %' : 'House buying 2,000 litres a year, air-to-water heat pump; oil price at −20%, today’s level and +20%', ['r', 'r', 'r']);
};

export default defineGuide({
  id: 'remplacer-chaudiere-fioul',
  group: 'usage',
  order: 4,
  mini: 'fioul',
  related: ['coup-de-pouce-chauffage', 'rentabilite-pompe-a-chaleur', 'pompe-a-chaleur-air-eau', 'pompe-a-chaleur-geothermique', 'maprimerenov-pompe-a-chaleur'],
  sources: ['wob', 'coupDePouce', 'spMpr', 'cre', 'ademe'],
  fr: {
    slug: 'remplacer-chaudiere-fioul',
    nav: 'Remplacer une chaudière fioul',
    card: 'Économie selon vos litres de fioul, Coup de pouce, dépose de la cuve.',
    title: 'Remplacer une chaudière fioul par une PAC : économie, aides',
    description: 'Remplacer une chaudière fioul par une pompe à chaleur en 2026 : économie selon vos litres, prix du fioul de la semaine, Coup de pouce ×5 et aide pour la cuve.',
    h1: 'Remplacer une chaudière fioul par une pompe à chaleur',
    intro: 'Le fioul est le cas où la pompe à chaleur rapporte le plus. Partez de vos litres achetés l’an dernier : le calcul donne l’économie au prix de la semaine.',
    resume: (h) => {
      const E = h.P.energie, prixL = E.fioul.eur_1000l_ttc / 1000;
      const ch = h.M.litresEnKwh(2000) * h.P.rendements.chaudiere_hypothese, pac = (ch / h.P.rendements.scop.air_eau) * E.electricite.kwh_ttc;
      return `Le chauffage au fioul est le plus cher par kWh de chaleur, et les chaudières au fioul neuves ne peuvent plus être installées depuis le 1er juillet 2022, sauf exceptions. Le remplacement par une pompe à chaleur air/eau garde les radiateurs à eau et, souvent, la production d’eau chaude. Au prix moyen relevé en France le ${h.date(E.fioul.date)} par le Weekly Oil Bulletin de la Commission européenne, ${h.num(prixL, 3)} € le litre, une maison qui achète ${h.num(2000)} litres par an paie ${h.eur(2000 * prixL)} ; la même chaleur produite par une PAC air/eau coûterait environ ${h.eur(pac)} d’électricité, soit ${h.eur(2000 * prixL - pac)} d’économie par an. Le calcul suppose qu’un litre de fioul contient environ 10 kWh et que la chaudière a un rendement de 86 %, deux hypothèses que vous pouvez ajuster. Côté aides, le remplacement d’une chaudière au fioul ouvre droit au Coup de pouce, qui multiplie la prime CEE par cinq, à MaPrimeRénov’ pour les ménages bleus, jaunes et violets, et à un forfait séparé pour la dépose de la cuve.`;
    },
    faqs: (h) => [
      { q: 'Que faire de la cuve à fioul ?', a: `Elle doit être vidée, dégazée et nettoyée par une entreprise spécialisée, puis enlevée ou neutralisée (remplie d’un matériau inerte) si elle est enterrée. MaPrimeRénov’ verse un forfait de dépose de cuve de ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.bleu)} à ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.violet)} selon la couleur, sur ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.plafond_depense)} de dépense au plus. Gardez le certificat de dégazage.` },
      { q: 'Peut-on remplacer une chaudière fioul par une chaudière fioul neuve ?', a: 'Plus depuis le 1er juillet 2022, sauf exceptions : quand aucune solution bas carbone n’est techniquement ou économiquement possible, par exemple faute de place ou de raccordement électrique suffisant. Une chaudière existante peut être réparée et entretenue. Une chaudière hybride ou fonctionnant au biofioul reste possible.' },
      { q: 'Combien de litres de fioul consomme une maison ?', a: 'Cela va de moins de 1 000 litres par an pour une petite maison bien isolée à plus de 3 000 pour une grande maison ancienne dans un climat froid. Le plus fiable est d’additionner vos livraisons des deux ou trois derniers hivers. Saisissez la moyenne dans le mini-calcul ou dans « Affiner » du simulateur.' },
    ],
    body: (h) => `<h2>L’économie selon vos litres</h2>
${litres(h)}
<p>Le prix du fioul change chaque semaine : le site le met à jour à partir du Weekly Oil Bulletin, qui publie un prix moyen national toutes taxes comprises pour 1 000 litres. Les livraisons réelles varient selon la quantité commandée et la région.</p>
<!--mini:fioul-->
<h2>Les aides du remplacement</h2>
<p>Le fioul cumule les aides les plus fortes : le Coup de pouce multiplie par cinq la prime CEE (voir ${h.a('coup-de-pouce-chauffage', 'Coup de pouce Chauffage')}), MaPrimeRénov’ verse son forfait PAC, et la dépose de la cuve a son propre forfait. L’écrêtement plafonne toutefois la somme des aides selon vos revenus. Le simulateur, réglé sur une chaudière au fioul, calcule l’ensemble pour votre département.</p>
<h2>Air/eau ou géothermie ?</h2>
<p>Une maison chauffée au fioul est souvent à la campagne, avec du terrain : la géothermie peut y être possible. Elle coûte plus cher à poser, mais son rendement plus élevé (${h.num(h.P.rendements.scop.geo, 1)} contre ${h.num(h.P.rendements.scop.air_eau, 1)}) augmente encore l’économie, et ses aides sont plus fortes. Voir ${h.a('pompe-a-chaleur-geothermique', 'PAC géothermique')}.</p>
<h2>Selon le climat de votre département</h2>
${climatFioul(h)}
<p>À maison égale, on brûle ${h.num(h.dep('25').dju / h.dep('83').dju, 1)} fois plus de fioul dans le Doubs que dans le Var, et l’économie suit. Si vous connaissez vos livraisons des dernières années, saisissez-les dans le simulateur : elles remplacent l’estimation par le climat.</p>
<h2>Et si les prix changent ?</h2>
${sensibilite(h)}
<p>L’économie résiste à une hausse de l’électricité, parce que la PAC en consomme environ trois fois moins que la chaleur qu’elle fournit. Elle baisse si le fioul devient moins cher, sans disparaître aux niveaux du tableau.</p>
<h2>Les points à vérifier</h2>
<p>Les radiateurs : une vieille installation au fioul fonctionne souvent avec de l’eau très chaude, à 70 °C ou plus. Une PAC haute température ou le remplacement de quelques radiateurs peut être nécessaire. La puissance électrique de l’abonnement. L’emplacement de l’unité extérieure, et le bruit pour le voisinage.</p>`,
  },
  en: {
    slug: 'replacing-oil-boiler',
    nav: 'Replacing an oil boiler',
    card: 'Saving from your litres of oil, Coup de pouce, tank removal grant.',
    title: 'Replacing an oil boiler with a heat pump: savings and grants',
    description: 'Replacing an oil boiler with a heat pump in France in 2026: saving from the litres you buy, this week’s oil price, Coup de pouce ×5 and the tank grant.',
    h1: 'Replacing an oil boiler with a heat pump',
    intro: 'Oil is where a heat pump saves the most. Start from the litres you bought last year: the calculation gives the saving at this week’s price.',
    resume: (h) => {
      const E = h.P.energie, prixL = E.fioul.eur_1000l_ttc / 1000;
      const ch = h.M.litresEnKwh(2000) * h.P.rendements.chaudiere_hypothese, pac = (ch / h.P.rendements.scop.air_eau) * E.electricite.kwh_ttc;
      return `Oil heating is the most expensive per kWh of heat, and new oil boilers can no longer be installed since 1 July 2022, with some exceptions. Replacing one with an air-to-water heat pump keeps the water radiators and often the hot water supply. At the French average price recorded on ${h.date(E.fioul.date)} by the European Commission’s Weekly Oil Bulletin, €${h.num(prixL, 3)} per litre, a house buying ${h.num(2000)} litres a year pays ${h.eur(2000 * prixL)}; the same heat from an air-to-water heat pump would cost about ${h.eur(pac)} in electricity, a saving of ${h.eur(2000 * prixL - pac)} a year. The calculation assumes a litre of oil holds about 10 kWh and the boiler is 86% efficient, two assumptions you can adjust. On grants, replacing an oil boiler qualifies for the Coup de pouce, which multiplies the CEE bonus by five, for MaPrimeRénov’ for blue, yellow and purple households, and for a separate flat rate for removing the tank.`;
    },
    faqs: (h) => [
      { q: 'What happens to the oil tank?', a: `It must be emptied, degassed and cleaned by a specialist firm, then removed or neutralised (filled with inert material) if buried. MaPrimeRénov’ pays a tank removal flat rate of ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.bleu)} to ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.violet)} depending on colour, on at most ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.plafond_depense)} of expense. Keep the degassing certificate.` },
      { q: 'Can I replace an oil boiler with a new oil boiler?', a: 'Not since 1 July 2022, with exceptions: where no low-carbon solution is technically or economically feasible, for instance for lack of space or of a sufficient electrical connection. An existing boiler can be repaired and serviced. A hybrid boiler or one running on bio-heating oil remains possible.' },
      { q: 'How many litres of oil does a house use?', a: 'From under 1,000 litres a year for a small, well insulated house to over 3,000 for a large old house in a cold climate. The most reliable way is to add up your deliveries over the last two or three winters. Enter the average in the mini-calculator or under “Refine” in the main calculator.' },
    ],
    body: (h) => `<h2>The saving from your litres</h2>
${litres(h)}
<p>The oil price changes every week: the site updates it from the Weekly Oil Bulletin, which publishes a national average price including taxes per 1,000 litres. Actual deliveries vary with the quantity ordered and the region.</p>
<!--mini:fioul-->
<h2>Grants for the switch</h2>
<p>Oil attracts the strongest grants: the Coup de pouce multiplies the CEE bonus by five (see ${h.a('coup-de-pouce-chauffage', 'Coup de pouce Chauffage')}), MaPrimeRénov’ pays its heat pump flat rate, and tank removal has its own flat rate. The cap nonetheless limits the total according to your income. The calculator, set to an oil boiler, works out the whole for your département.</p>
<h2>Air-to-water or ground-source?</h2>
<p>An oil-heated house is often rural, with land: ground-source may be possible. It costs more to fit, but its higher efficiency (${h.num(h.P.rendements.scop.geo, 1)} against ${h.num(h.P.rendements.scop.air_eau, 1)}) increases the saving further, and its grants are larger. See ${h.a('pompe-a-chaleur-geothermique', 'ground-source heat pump')}.</p>
<h2>Depending on your département’s climate</h2>
${climatFioul(h)}
<p>For the same house, ${h.num(h.dep('25').dju / h.dep('83').dju, 1)} times as much oil is burnt in the Doubs as in the Var, and the saving follows. If you know your deliveries over recent years, enter them in the calculator: they replace the climate-based estimate, which is only an average for a typical house in that département.</p>
<h2>What if prices change?</h2>
${sensibilite(h)}
<p>The saving holds up against higher electricity prices, because the heat pump uses about a third as much electricity as the heat it supplies. It falls if oil gets cheaper, without disappearing at the levels in the table. Prices of both energies are reread by the site from their public sources, so the table moves with them; the oil price is the weekly French average, and your own supplier’s price may differ by a few cents a litre.</p>
<p>One more factor works in the heat pump’s favour: oil is bought in advance, in deliveries of several hundred litres, while electricity is paid as it is used. Switching therefore frees the cash tied up in a full tank, and ends the yearly choice of when to order.</p>
<h2>What to check</h2>
<p>The radiators: an old oil installation often runs on very hot water, 70 °C or more. A high-temperature heat pump or replacing a few radiators may be needed. The electrical rating of your subscription. Where the outdoor unit goes, and noise for the neighbours.</p>`,
  },
});
