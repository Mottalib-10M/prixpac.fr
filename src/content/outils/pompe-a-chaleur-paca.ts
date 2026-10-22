import { defineGuide, type Helpers } from '../../lib/guide-types';
import { tableRegion } from '../../lib/region-pages';

const CODES = ['04', '05', '06', '13', '83', '84'];

/** Prime CEE d'une maison de 100 m² selon la zone et la couleur (moteur du site, Coup de pouce compris). */
const primes = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const zones = [['H1', 'Hautes-Alpes'], ['H2', fr ? 'Alpes-de-Haute-Provence, Vaucluse' : 'Alpes-de-Haute-Provence, Vaucluse'], ['H3', fr ? 'Alpes-Maritimes, Bouches-du-Rhône, Var' : 'Alpes-Maritimes, Bouches-du-Rhône, Var']] as const;
  const p = (zone: 'H1' | 'H2' | 'H3', couleur: 'bleu' | 'violet') => h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone, etasHaut: false, coupDePouce: true, couleur }).eur;
  return h.table(fr ? ['Zone', 'Départements', 'Facteur', 'Prime bleu ou jaune', 'Prime violet ou rose'] : ['Zone', 'Départements', 'Factor', 'Blue or yellow bonus', 'Purple or pink bonus'],
    zones.map(([z, d]) => [z, d, h.num(h.P.cee.zone[z], 1), h.eur(p(z, 'bleu')), h.eur(p(z, 'violet'))]),
    fr ? `Prime CEE BAR-TH-171 avec Coup de pouce pour une PAC air/eau dans une maison de 100 m², aux prix moyens Emmy de ${h.moisCee}` : `CEE bonus BAR-TH-171 with Coup de pouce for an air-to-water heat pump in a 100 m² house, at Emmy average prices for ${h.moisCee}`, ['l', 'l', 'r', 'r', 'r']);
};

/** Air/air ou air/eau dans le Var : économie, aides, reste à charge. */
const varTypes = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = (['air_air', 'air_eau'] as const).map((t) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, dep: '83', type: t, energie: 'elec' });
    return [t === 'air_air' ? (fr ? 'Air/air' : 'Air-to-air') : (fr ? 'Air/eau' : 'Air-to-water'), h.eur(r.prixTtc), h.eur(r.mpr), r.cee.chiffre ? h.eur(r.cee.eur) : (fr ? 'non chiffrée' : 'not estimated'), h.eur(r.resteACharge), h.eur(r.economie), r.retourAns === null ? '—' : `${h.num(r.retourAns, 0)} ${fr ? 'ans' : 'yrs'}`];
  });
  return h.table(fr ? ['PAC', 'Prix TTC', 'MaPrimeRénov’', 'Prime CEE', 'Reste à charge', 'Économie / an', 'Retour'] : ['Heat pump', 'Price incl. VAT', 'MaPrimeRénov’', 'CEE bonus', 'Left to pay', 'Saving / yr', 'Payback'], rows,
    fr ? 'Var, maison de 100 m² à isolation moyenne chauffée par radiateurs électriques, ménage de 3 personnes à 40 000 € de revenu ; prix médians du site' : 'Var, averagely insulated 100 m² house heated by electric radiators, household of 3 with €40,000 income; the site’s median prices', ['l', 'r', 'r', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'pompe-a-chaleur-paca',
  group: 'territoires',
  order: 5,
  tool: 'departements',
  region: "Provence-Alpes-Côte d'Azur",
  related: ['pompe-a-chaleur-par-departement', 'pompe-a-chaleur-air-air', 'prime-cee-pompe-a-chaleur', 'remplacer-radiateurs-electriques', 'climat-degres-jours-departement'],
  sources: ['meteo', 'zones', 'bar171', 'coupDePouce', 'emmy', 'cre', 'spMpr'],
  fr: {
    slug: 'pompe-a-chaleur-paca',
    nav: 'PAC en PACA',
    card: 'Du Var aux Hautes-Alpes : trois zones climatiques, trois primes.',
    title: 'Pompe à chaleur en PACA : économie et prime CEE en 2026',
    description: 'Pompe à chaleur en Provence-Alpes-Côte d’Azur : trois zones climatiques, prime CEE, air/air ou air/eau, économie annuelle dans les 6 départements, du Var à Gap.',
    h1: 'Pompe à chaleur en PACA : de la côte à la montagne',
    intro: 'Le tableau est filtré sur Provence-Alpes-Côte d’Azur : changez la surface, l’énergie ou l’isolation, ou choisissez une autre région.',
    resume: (h) => {
      const v = h.dep('83'), g = h.dep('05');
      const ev = h.M.simuler({ ...h.M.DEFAUT, dep: '83' }).economie, eg = h.M.simuler({ ...h.M.DEFAUT, dep: '05' }).economie;
      return `Provence-Alpes-Côte d’Azur est la seule région de métropole dont les départements couvrent les trois zones climatiques : H3 sur la côte (Alpes-Maritimes, Bouches-du-Rhône, Var), H2 dans l’arrière-pays (Alpes-de-Haute-Provence, Vaucluse), H1 dans les Hautes-Alpes. La station de Toulon compte ${h.num(v.dju)} degrés-jours par an, celle de Gap ${h.num(g.dju)}, plus du double, d’après Météo-France sur 2015-2024. Pour une maison de 100 m² moyennement isolée qui remplace une chaudière au gaz par une PAC air/eau, l’économie va ainsi d’environ ${h.eur(ev)} par an dans le Var à ${h.eur(eg)} dans les Hautes-Alpes. La prime CEE suit la même pente : son facteur de zone vaut ${h.num(h.P.cee.zone.H3, 1)} en H3 contre ${h.num(h.P.cee.zone.H1, 1)} en H1. Sur la côte, où l’on chauffe peu et où l’on rafraîchit l’été, beaucoup de ménages hésitent entre une PAC air/air, sans MaPrimeRénov’, et une PAC air/eau aidée. Le tableau calcule les deux cas.`;
    },
    faqs: (h) => [
      { q: 'Une pompe à chaleur est-elle rentable sur la Côte d’Azur ?', a: `Moins qu’ailleurs, parce qu’on y chauffe peu : la station de Nice-Rimiez compte ${h.num(h.dep('06').dju)} degrés-jours par an. L’économie annuelle étant faible, le temps de retour s’allonge, surtout avec un devis élevé. L’intérêt grandit si vous quittez des radiateurs électriques ou du fioul, ou si la PAC sert aussi à rafraîchir l’été.` },
      { q: 'La climatisation réversible compte-t-elle comme pompe à chaleur ?', a: 'Oui : une climatisation réversible est une PAC air/air. Elle chauffe et rafraîchit, mais elle n’ouvre pas droit à MaPrimeRénov’, et sa prime CEE relève d’une autre fiche, BAR-TH-129, que le site ne chiffre pas faute de prix publié. En mode froid, elle augmente aussi la facture d’électricité de l’été.' },
      { q: 'Faut-il une PAC spéciale en montagne ?', a: `Au-dessus de 1 000 m, le froid de base descend souvent sous −10 °C : il faut une PAC dont la puissance est garantie à cette température, ou un appoint. À Gap, le froid typique est de ${h.num(h.dep('05').tbase, 1)} °C ; dans les stations d’altitude des Hautes-Alpes, il est bien plus bas. La géothermie, moins sensible au froid de l’air, y garde son rendement.` },
    ],
    body: (h) => `<h2>Les six départements, du plus doux au plus froid</h2>
${tableRegion(h, CODES)}
<p>Le chef-lieu ne dit pas tout dans une région aussi montagneuse : les Alpes-Maritimes vont de Menton à plus de 2 000 m. Le simulateur de la page d’accueil reprend toutes les stations Météo-France de chaque département ; choisissez la plus proche de chez vous et de la même altitude.</p>
<h2>Trois zones, trois primes CEE</h2>
${primes(h)}
<p>À projet égal, un ménage des Hautes-Alpes touche une prime ${h.num(h.P.cee.zone.H1 / h.P.cee.zone.H3, 1)} fois plus forte qu’un ménage du Var. Le détail du calcul est sur la page ${h.a('prime-cee-pompe-a-chaleur', 'prime CEE')}, et les règles du ${h.src('coupDePouce', 'Coup de pouce chauffage')} s’appliquent partout.</p>
<h2>Sur la côte : air/air ou air/eau ?</h2>
${varTypes(h)}
<p>L’air/air coûte moins cher mais ne reçoit pas MaPrimeRénov’ ; l’air/eau, aidée, demande des radiateurs à eau ou un plancher chauffant, ce qui exclut souvent la maison chauffée par convecteurs. Le site prend le même rendement saisonnier pour les deux faute de mesure publique pour l’air/air ; la page ${h.a('pompe-a-chaleur-air-air', 'PAC air/air')} détaille ce choix et celle sur le ${h.a('remplacer-radiateurs-electriques', 'remplacement des radiateurs électriques')} les travaux à prévoir.</p>`,
  },
  en: {
    slug: 'heat-pump-paca',
    nav: 'Heat pump in PACA',
    card: 'From the Var to the Hautes-Alpes: three climate zones, three bonuses.',
    title: 'Heat pump in PACA, France: savings and CEE bonus for 2026',
    description: 'Heat pumps in Provence-Alpes-Côte d’Azur: three climate zones, CEE bonus, air-to-air or air-to-water, yearly saving in all 6 départements, Var to Gap.',
    h1: 'Heat pumps in PACA: from the coast to the mountains',
    intro: 'The table is filtered on Provence-Alpes-Côte d’Azur: change the floor area, energy or insulation, or pick another region.',
    resume: (h) => {
      const v = h.dep('83'), g = h.dep('05');
      const ev = h.M.simuler({ ...h.M.DEFAUT, dep: '83' }).economie, eg = h.M.simuler({ ...h.M.DEFAUT, dep: '05' }).economie;
      return `Provence-Alpes-Côte d’Azur is the only mainland region whose départements cover all three climate zones: H3 on the coast (Alpes-Maritimes, Bouches-du-Rhône, Var), H2 in the hinterland (Alpes-de-Haute-Provence, Vaucluse), H1 in the Hautes-Alpes. The Toulon station records ${h.num(v.dju)} degree-days a year, Gap ${h.num(g.dju)}, more than double, according to Météo-France for 2015-2024. For an averagely insulated 100 m² house replacing a gas boiler with an air-to-water heat pump, the saving therefore ranges from about ${h.eur(ev)} a year in the Var to ${h.eur(eg)} in the Hautes-Alpes. The CEE bonus follows the same slope: its zone factor is ${h.num(h.P.cee.zone.H3, 1)} in H3 against ${h.num(h.P.cee.zone.H1, 1)} in H1. On the coast, where little heating is needed and homes are cooled in summer, many households weigh an air-to-air heat pump, with no MaPrimeRénov’, against a subsidised air-to-water one. The table works out both cases.`;
    },
    faqs: (h) => [
      { q: 'Does a heat pump pay off on the Côte d’Azur?', a: `Less than elsewhere, because little heating is needed: the Nice-Rimiez station records ${h.num(h.dep('06').dju)} degree-days a year. With a small yearly saving, payback takes longer, especially with a high quote. It becomes more worthwhile if you are leaving electric radiators or heating oil, or if the heat pump also cools the house in summer.` },
      { q: 'Does reversible air conditioning count as a heat pump?', a: 'Yes: reversible air conditioning is an air-to-air heat pump. It heats and cools, but it does not qualify for MaPrimeRénov’, and its CEE bonus falls under another sheet, BAR-TH-129, which the site does not estimate for lack of a published price. In cooling mode it also adds to the summer electricity bill.' },
      { q: 'Do you need a special heat pump in the mountains?', a: `Above 1,000 m, the design temperature often falls below −10 °C: you need a heat pump whose output is guaranteed at that temperature, or a backup. In Gap, the typical cold is ${h.num(h.dep('05').tbase, 1)} °C; at high-altitude stations in the Hautes-Alpes it is much lower. Ground-source, less sensitive to cold air, keeps its efficiency there.` },
    ],
    body: (h) => `<h2>The six départements, from mildest to coldest</h2>
${tableRegion(h, CODES)}
<p>The main town does not tell the whole story in such a mountainous region: the Alpes-Maritimes run from Menton to over 2,000 m. The calculator on the home page includes every Météo-France station in each département; pick the one nearest you and at a similar altitude.</p>
<h2>Three zones, three CEE bonuses</h2>
${primes(h)}
<p>For the same project, a household in the Hautes-Alpes gets a bonus ${h.num(h.P.cee.zone.H1 / h.P.cee.zone.H3, 1)} times as high as one in the Var. The calculation is detailed on the ${h.a('prime-cee-pompe-a-chaleur', 'CEE bonus')} page, and the ${h.src('coupDePouce', 'Coup de pouce chauffage')} rules apply everywhere.</p>
<h2>On the coast: air-to-air or air-to-water?</h2>
${varTypes(h)}
<p>Air-to-air costs less but gets no MaPrimeRénov’; air-to-water, which is subsidised, needs water radiators or underfloor heating, which often rules out a house heated by convectors. The site uses the same seasonal efficiency for both for lack of a public measurement for air-to-air; the ${h.a('pompe-a-chaleur-air-air', 'air-to-air heat pump')} page explains this choice and the one on ${h.a('remplacer-radiateurs-electriques', 'replacing electric radiators')} the work involved.</p>`,
  },
});
