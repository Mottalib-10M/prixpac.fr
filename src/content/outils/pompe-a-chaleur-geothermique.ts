import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Aides d'une PAC géothermique pour un devis donné, par couleur (moteur du site). */
const aides = (h: Helpers, devis: number) => {
  const fr = h.lang === 'fr';
  const cas: Array<[number, string, string]> = [[20000, 'Bleu', 'Blue'], [35000, 'Jaune', 'Yellow'], [50000, 'Violet', 'Purple'], [90000, 'Rose', 'Pink']];
  return h.table(fr ? ['Catégorie', 'Forfait', 'MaPrimeRénov’ versée', 'Prime CEE', 'Reste à charge'] : ['Category', 'Flat rate', 'MaPrimeRénov’ paid', 'CEE bonus', 'Out of pocket'],
    cas.map(([rfr, f, e]) => { const r = h.M.simuler({ ...h.M.DEFAUT, type: 'geo', rfr, prixTtc: devis }); return [fr ? f : e, h.eur(r.forfait), h.eur(r.mpr), h.eur(r.cee.eur), h.eur(r.resteACharge)]; }),
    fr ? `Exemple : devis hypothétique de ${h.eur(devis)} TTC, maison de 100 m² dans le Rhône, chaudière gaz remplacée, Etas de 111 à 170 %` : `Example: hypothetical ${h.eur(devis)} quote incl. VAT, 100 m² house in the Rhône, gas boiler replaced, Etas 111 to 170%`, ['l', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-geothermique',
  group: 'prix',
  order: 4,
  tool: 'simulateur',
  preset: { type: 'geo' },
  types: ['geo'],
  focus: 'rac',
  related: ['pompe-a-chaleur-air-eau', 'prime-cee-pompe-a-chaleur', 'maprimerenov-pompe-a-chaleur', 'ecretement-maprimerenov', 'consommation-pompe-a-chaleur'],
  sources: ['spMpr', 'bar172', 'coupDePouce', 'ademe', 'decret2020'],
  fr: {
    slug: 'pompe-a-chaleur-geothermique',
    nav: 'PAC géothermique',
    card: 'Forfait jusqu’à 11 000 €, fiche CEE BAR-TH-172, rendement 4,1.',
    title: 'Pompe à chaleur géothermique 2026 : aides et reste à charge',
    description: 'Pompe à chaleur géothermique en 2026 : MaPrimeRénov’ jusqu’à 11 000 €, prime CEE de la fiche BAR-TH-172, écrêtement, rendement mesuré de 4,1 et reste à charge.',
    h1: 'Pompe à chaleur géothermique : aides 2026 et reste à charge',
    intro: 'La géothermie a les forfaits les plus élevés de MaPrimeRénov’ et le meilleur rendement. Son prix, lui, n’est publié par aucune source ouverte : partez de votre devis.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits.geo, C = h.P.cee.bar_th_172;
      return `Une pompe à chaleur géothermique puise la chaleur du sol, par des capteurs horizontaux enterrés ou une sonde verticale forée, ou celle d’une nappe d’eau souterraine. Elle alimente un chauffage central comme une PAC air/eau, mais avec une source de chaleur stable toute l’année : l’ADEME a mesuré un rendement annuel moyen de ${h.num(h.P.rendements.scop.geo, 1)}, contre ${h.num(h.P.rendements.scop.air_eau, 1)} pour l’air/eau. En 2026, MaPrimeRénov’ par geste verse ${h.eur(F.bleu)} à un ménage bleu, ${h.eur(F.jaune)} à un jaune et ${h.eur(F.violet)} à un violet, sur une dépense retenue de ${h.eur(F.plafond_depense)} au plus. La prime CEE relève de la fiche BAR-TH-172, réservée aux maisons : ${h.num(C.maison.etas_bas)} kWh cumac si l’efficacité saisonnière est comprise entre 111 et 170 %, ${h.num(C.maison.etas_haut)} au-delà, avant facteurs de surface, de zone et Coup de pouce. Aucune source ouverte ne publie de prix de géothermie : le simulateur part du plafond de dépense, qui n’est pas un prix, et attend votre devis.`;
    },
    faqs: (h) => [
      { q: 'Faut-il une autorisation pour forer une sonde géothermique ?', a: 'Un forage de géothermie de minime importance relève d’une déclaration préalable, faite par l’entreprise de forage qui doit être qualifiée. Les capteurs horizontaux, enterrés à faible profondeur, n’en demandent pas mais exigent un grand terrain libre. Votre installateur doit indiquer dans son devis la technique retenue et les démarches incluses.' },
      { q: 'Pourquoi la géothermie a-t-elle droit à plus de MaPrimeRénov’ que l’air/eau ?', a: `Parce qu’elle coûte plus cher à installer et rend davantage : le barème 2026 lui accorde jusqu’à ${h.eur(h.P.maprimerenov.forfaits.geo.bleu)} sur une dépense retenue de ${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)}, contre ${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu)} et ${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)} pour l’air/eau. L’écrêtement s’applique de la même façon : les aides ne dépassent jamais la part maximale de la dépense.` },
      { q: 'Une PAC géothermique en appartement a-t-elle une prime CEE ?', a: 'La fiche BAR-TH-172 ne vise que les maisons individuelles existantes. En appartement, la géothermie relève en pratique d’une installation collective, avec d’autres fiches CEE que ce site ne chiffre pas. Le simulateur affiche donc « non chiffrée » si vous choisissez un appartement avec une PAC géothermique.' },
    ],
    body: (h) => `<h2>Les aides pour un devis donné</h2>
<p>Comme il n’existe pas de prix public de référence, voici les aides calculées par le moteur du site sur un devis hypothétique, à remplacer par le vôtre dans le simulateur :</p>
${aides(h, 24000)}
<p>Avec un devis supérieur au plafond de dépense, le reste à charge grimpe vite : l’écrêtement se calcule sur ${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)} au plus, et tout ce qui dépasse est payé par le ménage. Pour un ménage violet, MaPrimeRénov’ peut être réduite par une prime CEE élevée, comme l’explique la page ${h.a('ecretement-maprimerenov', 'de l’écrêtement')}.</p>
<h2>Une consommation plus faible et plus stable</h2>
<p>Le sol garde une température à peu près constante en hiver. La PAC géothermique ne perd donc pas de rendement par grand froid, contrairement à l’air/eau, et n’a pas besoin de dégivrer. Pour une même maison, sa facture d’électricité est environ 30 % plus basse que celle d’une PAC air/eau, d’après les rendements mesurés par l’ADEME (${h.num(h.P.rendements.scop.geo, 1)} contre ${h.num(h.P.rendements.scop.air_eau, 1)}). Le simulateur le chiffre avec le climat de votre département.</p>
<h2>Les points à vérifier</h2>
<p>La technique de captage et sa justification (surface du terrain, profondeur de forage, étude de sol) ; la qualification de l’installateur et celle du foreur ; l’efficacité saisonnière, qui détermine le palier de la prime CEE ; le Coup de pouce, qui exige depuis le 1er septembre 2026 un modèle agréé et le remplacement d’une chaudière au charbon, au fioul ou au gaz. La prime CEE de la géothermie, avec une durée de vie conventionnelle de ${h.num(h.P.cee.bar_th_172.duree_vie_ans)} ans, est plus forte que celle de l’air/eau : voir la page ${h.a('prime-cee-pompe-a-chaleur', 'prime CEE')}.</p>`,
  },
  en: {
    slug: 'ground-source-heat-pump',
    nav: 'Ground-source heat pump',
    card: 'Grant up to €11,000, CEE sheet BAR-TH-172, measured efficiency 4.1.',
    title: 'Ground-source heat pump France 2026: grants and net cost',
    description: 'Ground-source heat pump in France in 2026: MaPrimeRénov’ up to €11,000, CEE bonus from sheet BAR-TH-172, the grant cap, measured 4.1 efficiency and net cost.',
    h1: 'Ground-source heat pump: 2026 grants and out-of-pocket cost',
    intro: 'Ground-source heating has the highest MaPrimeRénov’ flat rates and the best efficiency. Its price, though, is published by no open source: start from your quote.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits.geo, C = h.P.cee.bar_th_172;
      return `A ground-source heat pump draws heat from the ground, through horizontal buried collectors or a drilled vertical borehole, or from groundwater. It feeds a central heating system like an air-to-water unit, but from a heat source that stays stable all year: ADEME measured an average yearly efficiency of ${h.num(h.P.rendements.scop.geo, 1)}, against ${h.num(h.P.rendements.scop.air_eau, 1)} for air-to-water. In 2026 the per-item MaPrimeRénov’ pays ${h.eur(F.bleu)} to a blue household, ${h.eur(F.jaune)} to yellow and ${h.eur(F.violet)} to purple, on an eligible expense of at most ${h.eur(F.plafond_depense)}. The CEE bonus comes under sheet BAR-TH-172, which covers houses only: ${h.num(C.maison.etas_bas)} kWh cumac if seasonal efficiency is between 111% and 170%, ${h.num(C.maison.etas_haut)} above that, before the area, zone and Coup de pouce factors. No open source publishes ground-source prices: the calculator starts from the expense ceiling, which is not a price, and waits for your quote.`;
    },
    faqs: (h) => [
      { q: 'Do I need permission to drill a geothermal borehole?', a: 'Minor geothermal drilling requires a prior declaration, made by the drilling firm, which must be certified. Horizontal collectors, buried at shallow depth, need no declaration but require a large clear plot. Your installer’s quote should state the technique chosen and the formalities included.' },
      { q: 'Why does ground-source get more MaPrimeRénov’ than air-to-water?', a: `Because it costs more to install and performs better: the 2026 scale grants it up to ${h.eur(h.P.maprimerenov.forfaits.geo.bleu)} on an eligible expense of ${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)}, against ${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu)} and ${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)} for air-to-water. The cap applies in the same way: grants never exceed the maximum share of the expense.` },
      { q: 'Is there a CEE bonus for a ground-source heat pump in a flat?', a: 'Sheet BAR-TH-172 covers existing individual houses only. In a flat, ground-source heating is in practice a shared installation, under other CEE sheets that this site does not calculate. The calculator therefore shows “not calculated” if you choose a flat with a ground-source heat pump.' },
    ],
    body: (h) => `<h2>Grants for a given quote</h2>
<p>As there is no public reference price, here are the grants worked out by the site’s engine on a hypothetical quote, to be replaced by yours in the calculator:</p>
${aides(h, 24000)}
<p>With a quote above the expense ceiling, the out-of-pocket cost climbs fast: the cap is calculated on ${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)} at most, and everything above is paid by the household. For a purple household, MaPrimeRénov’ can be cut by a high CEE bonus, as the ${h.a('ecretement-maprimerenov', 'grant cap page')} explains.</p>
<h2>Lower, steadier consumption</h2>
<p>The ground stays at a roughly constant temperature in winter. A ground-source heat pump therefore keeps its efficiency in hard frosts, unlike air-to-water, and never needs to defrost. For the same house, its electricity bill is about 30% lower than an air-to-water unit’s, based on ADEME’s measured efficiencies (${h.num(h.P.rendements.scop.geo, 1)} against ${h.num(h.P.rendements.scop.air_eau, 1)}). The calculator works it out with your département’s climate.</p>
<h2>What to check</h2>
<p>The collection technique and its justification (plot size, borehole depth, ground survey); the installer’s and the driller’s certification; the seasonal efficiency, which sets the CEE bonus band; the Coup de pouce, which since 1 September 2026 requires an approved model and the replacement of a coal, oil or gas boiler. The ground-source CEE bonus, with a ${h.num(h.P.cee.bar_th_172.duree_vie_ans)}-year conventional lifetime, is higher than air-to-water’s: see the ${h.a('prime-cee-pompe-a-chaleur', 'CEE bonus page')}.</p>`,
  },
});
