import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Prix publiés par l'observatoire, par type, avec le prix au kW. */
const tableau = (h: Helpers) => {
  const fr = h.lang === 'fr', O = h.P.prix_installation;
  return h.table(fr ? ['Type de PAC', 'Devis', 'Prix médian TTC', 'Prix médian au kW'] : ['Heat pump type', 'Quotes', 'Median price incl. VAT', 'Median price per kW'], [
    [fr ? 'Air/air (clim réversible)' : 'Air-to-air (reversible AC)', h.num(O.air_air.n), h.eur(O.air_air.median_ttc), h.eur(O.air_air.eur_par_kw)],
    [fr ? 'Air/eau (chauffage central)' : 'Air-to-water (central heating)', h.num(O.air_eau.n), h.eur(O.air_eau.median_ttc), h.eur(O.air_eau.eur_par_kw)],
    [fr ? 'Géothermique' : 'Ground-source', '—', fr ? 'non publié' : 'not published', '—'],
  ], fr ? `Observatoire ScoreSolaire des devis de PAC, mise à jour du ${h.date(O.date)}, licence CC BY 4.0` : `ScoreSolaire heat pump quote observatory, updated ${h.date(O.date)}, CC BY 4.0 licence`, ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'prix-pompe-a-chaleur',
  group: 'prix',
  order: 1,
  tool: 'simulateur',
  focus: 'prix',
  related: ['pompe-a-chaleur-air-eau', 'pompe-a-chaleur-air-air', 'pompe-a-chaleur-geothermique', 'puissance-pompe-a-chaleur', 'maprimerenov-pompe-a-chaleur', 'rentabilite-pompe-a-chaleur'],
  sources: ['observatoire', 'tva', 'spMpr', 'bar171', 'emmy'],
  fr: {
    slug: 'prix-pompe-a-chaleur',
    nav: 'Prix d’une pompe à chaleur',
    card: 'Médiane des devis réels, prix au kW, TVA à 5,5 %, aides déduites.',
    title: 'Prix pompe à chaleur 2026 : devis médians, prix après aides',
    description: 'Prix d’une pompe à chaleur en 2026 : médiane des devis réels air/eau et air/air, prix au kW, TVA à 5,5 %, puis MaPrimeRénov’ et prime CEE déduites chez vous.',
    h1: 'Prix d’une pompe à chaleur en 2026, avant et après aides',
    intro: 'Le prix médian des devis réellement reçus par des particuliers, puis ce qu’il reste à payer chez vous une fois les aides déduites. Saisissez votre devis pour le vérifier.',
    resume: (h) => {
      const O = h.P.prix_installation;
      return `Une pompe à chaleur air/eau, qui remplace une chaudière sur un circuit de chauffage central, coûte ${h.eur(O.air_eau.median_ttc)} TTC en médiane d’après les ${h.num(O.air_eau.n)} devis de ce type publiés par l’observatoire ScoreSolaire (licence ouverte CC BY 4.0, mise à jour du ${h.date(O.date)}), entre ${h.eur(O.air_eau.min)} et ${h.eur(O.air_eau.max)}. Une PAC air/air, c’est-à-dire une climatisation réversible à une ou plusieurs unités intérieures, coûte ${h.eur(O.air_air.median_ttc)} en médiane sur ${h.num(O.air_air.n)} devis, soit ${h.eur(O.air_air.eur_par_kw)} par kilowatt de puissance. Aucune source ouverte ne publie de prix pour la géothermie. Ces prix s’entendent TVA à 5,5 % comprise, le taux réduit des équipements de rénovation énergétique dans un logement de plus de deux ans. Le prix payé est bien plus bas une fois MaPrimeRénov’ et la prime CEE déduites : le simulateur de cette page part du prix médian, ou de votre devis, et calcule le reste à charge avec vos revenus et votre département.`;
    },
    faqs: (h) => {
      const O = h.P.prix_installation;
      return [
        { q: 'Pourquoi les prix de PAC annoncés en ligne vont-ils de 3 000 à 45 000 € ?', a: 'Parce qu’ils mélangent des machines sans rapport : une clim réversible mono-split pour une pièce, une PAC air/eau qui chauffe toute une maison et produit l’eau chaude, une géothermie avec forage. Comparez à type égal et à puissance égale : c’est ce que fait le tableau de cette page, avec la médiane des devis par type et le prix au kilowatt.' },
        { q: 'Un devis de PAC air/eau à 18 000 € est-il trop cher ?', a: `Il est au-dessus de la médiane observée (${h.eur(O.air_eau.median_ttc)}), sans être hors marché : l’observatoire relève des devis air/eau jusqu’à ${h.eur(O.air_eau.max)}. Regardez ce qu’il contient : ballon d’eau chaude, dépose de l’ancienne chaudière et de la cuve, remplacement de radiateurs, puissance. Rapporté au kilowatt, un prix très supérieur à ${h.eur(O.air_eau.eur_par_kw)} mérite une deuxième offre.` },
        { q: 'La TVA à 5,5 % s’applique-t-elle à toutes les pompes à chaleur ?', a: 'Elle s’applique aux PAC air/eau et géothermiques, et aux PAC air/air qui respectent les critères de performance, posées par une entreprise dans un logement achevé depuis plus de deux ans. Un équipement acheté seul et posé soi-même reste à 20 %, tout comme une chaudière au fioul ou au gaz.' },
      ];
    },
    body: (h) => {
      const O = h.P.prix_installation;
      return `<h2>Les prix relevés sur des devis réels</h2>
<p>Plutôt que de recopier des fourchettes d’installateurs, nous partons d’un jeu de données ouvert : l’observatoire ScoreSolaire agrège des devis de PAC reçus par des particuliers et analysés un par un. Il est petit (${h.num(O.n_devis)} devis), surtout pour l’air/eau, et nous le disons. Mais c’est un prix observé, pas un prix d’appel.</p>
${tableau(h)}
<p>La médiane air/eau repose sur ${h.num(O.air_eau.n)} devis seulement : elle est indicative. Elle sert de point de départ au simulateur, et votre devis la remplace dès que vous le saisissez dans « Affiner ».</p>
<h2>Ce qui fait varier le prix</h2>
<p>La puissance d’abord : une maison mal isolée dans un département froid demande une machine plus puissante, donc plus chère. Ensuite ce que le devis inclut : ballon d’eau chaude intégré ou séparé, dépose de l’ancienne chaudière, neutralisation ou dépose d’une cuve à fioul, adaptation des radiateurs, mise à niveau du tableau électrique. Enfin la température d’eau : une PAC haute température, qui alimente de vieux radiateurs, coûte plus cher qu’une PAC basse température sur un plancher chauffant. Le ${h.a('puissance-pompe-a-chaleur', 'calcul de puissance')} donne l’ordre de grandeur pour votre logement.</p>
<h2>La TVA à 5,5 %</h2>
<p>Les PAC posées par une entreprise dans un logement de plus de deux ans bénéficient du taux réduit de ${h.pct(h.P.tva.pac, 1)}, au lieu de ${h.pct(h.P.tva.chaudiere_fossile, 0)} pour une chaudière au fioul ou au gaz. Sur un devis de ${h.eur(12000)} hors taxes, l’écart représente ${h.eur(12000 * (h.P.tva.chaudiere_fossile - h.P.tva.pac))}.</p>
<!--mini:tva-->
<h2>Du prix au reste à charge</h2>
<p>Le simulateur déduit MaPrimeRénov’ (PAC air/eau et géothermique seulement), la prime CEE estimée au prix du registre Emmy, puis applique l’écrêtement qui limite le total des aides. Pour une PAC air/eau au prix médian, le reste à charge va de quelques milliers d’euros pour un ménage modeste à près du prix plein pour un ménage aux revenus supérieurs. Le détail des aides est sur la page ${h.a('maprimerenov-pompe-a-chaleur', 'MaPrimeRénov’ pompe à chaleur')}.</p>`;
    },
  },
  en: {
    slug: 'heat-pump-price',
    nav: 'Heat pump price',
    card: 'Median of real quotes, price per kW, 5.5% VAT, grants deducted.',
    title: 'Heat pump price France 2026: median quotes and net cost',
    description: 'Heat pump prices in France in 2026: median of real air-to-water and air-to-air quotes, price per kW, 5.5% VAT, then MaPrimeRénov’ and the CEE bonus deducted.',
    h1: 'Heat pump prices in France in 2026, before and after grants',
    intro: 'The median of quotes actually received by households, then what is left to pay in your case once grants are deducted. Enter your own quote to check it.',
    resume: (h) => {
      const O = h.P.prix_installation;
      return `An air-to-water heat pump, which replaces a boiler on a central heating circuit, costs ${h.eur(O.air_eau.median_ttc)} including VAT at the median of the ${h.num(O.air_eau.n)} quotes of that type published by the ScoreSolaire observatory (open CC BY 4.0 licence, updated ${h.date(O.date)}), ranging from ${h.eur(O.air_eau.min)} to ${h.eur(O.air_eau.max)}. An air-to-air heat pump, that is, reversible air conditioning with one or more indoor units, costs a median ${h.eur(O.air_air.median_ttc)} across ${h.num(O.air_air.n)} quotes, or ${h.eur(O.air_air.eur_par_kw)} per kilowatt of output. No open source publishes ground-source prices. These prices include VAT at 5.5%, the reduced rate for energy-renovation equipment in a home over two years old. The price you pay is far lower once MaPrimeRénov’ and the CEE bonus are deducted: the calculator on this page starts from the median price, or your quote, and works out the out-of-pocket cost from your income and département.`;
    },
    faqs: (h) => {
      const O = h.P.prix_installation;
      return [
        { q: 'Why do heat pump prices quoted online range from €3,000 to €45,000?', a: 'Because they lump together unrelated machines: a single-room reversible air conditioner, an air-to-water heat pump that heats a whole house and makes hot water, a ground-source system with drilling. Compare like with like, type for type and output for output: that is what the table on this page does, with the median quote per type and the price per kilowatt.' },
        { q: 'Is an €18,000 quote for an air-to-water heat pump too expensive?', a: `It is above the observed median (${h.eur(O.air_eau.median_ttc)}) without being out of the market: the observatory records air-to-water quotes up to ${h.eur(O.air_eau.max)}. Check what it includes: hot-water cylinder, removal of the old boiler and tank, new radiators, output. Per kilowatt, a price far above ${h.eur(O.air_eau.eur_par_kw)} deserves a second quote.` },
        { q: 'Does 5.5% VAT apply to every heat pump?', a: 'It applies to air-to-water and ground-source heat pumps, and to air-to-air units that meet the performance criteria, fitted by a firm in a home completed over two years ago. Equipment bought on its own and fitted yourself stays at 20%, as does an oil or gas boiler.' },
      ];
    },
    body: (h) => {
      const O = h.P.prix_installation;
      return `<h2>Prices taken from real quotes</h2>
<p>Rather than copying installers’ price ranges, we start from an open dataset: the ScoreSolaire observatory pools heat pump quotes received by households and analysed one by one. It is small (${h.num(O.n_devis)} quotes), especially for air-to-water, and we say so. But it is an observed price, not a teaser price.</p>
${tableau(h)}
<p>The air-to-water median rests on only ${h.num(O.air_eau.n)} quotes: treat it as indicative. It is the calculator’s starting point, and your own quote replaces it as soon as you enter it under “Refine”.</p>
<h2>What makes the price vary</h2>
<p>Output first: a poorly insulated house in a cold département needs a more powerful machine, so a dearer one. Then what the quote includes: built-in or separate hot-water cylinder, removal of the old boiler, decommissioning or removal of an oil tank, radiator changes, an upgrade of the fuse box. Finally the water temperature: a high-temperature heat pump feeding old radiators costs more than a low-temperature one on underfloor heating. The ${h.a('puissance-pompe-a-chaleur', 'output calculation')} gives the order of magnitude for your home.</p>
<h2>VAT at 5.5%</h2>
<p>Heat pumps fitted by a firm in a home over two years old get the reduced rate of ${h.pct(h.P.tva.pac, 1)}, instead of ${h.pct(h.P.tva.chaudiere_fossile, 0)} for an oil or gas boiler. On a quote of ${h.eur(12000)} before tax, the difference is ${h.eur(12000 * (h.P.tva.chaudiere_fossile - h.P.tva.pac))}.</p>
<!--mini:tva-->
<h2>From price to out-of-pocket cost</h2>
<p>The calculator deducts MaPrimeRénov’ (air-to-water and ground-source only) and the CEE bonus estimated at the Emmy registry price, then applies the cap that limits total grants. For an air-to-water unit at the median price, the out-of-pocket cost runs from a few thousand euros for a low-income household to close to the full price for a higher-income one. The grants are detailed on the ${h.a('maprimerenov-pompe-a-chaleur', 'MaPrimeRénov’ heat pump page')}.</p>`;
    },
  },
});
