import { defineGuide } from '../../lib/guide-types';
import { tableCouleur } from '../../lib/couleur-pages';

const RFR = 90000;

export default defineGuide({
  id: 'maprimerenov-rose',
  group: 'aides',
  order: 9,
  tool: 'simulateur',
  preset: { rfr: RFR, personnes: 3 },
  focus: 'rac',
  related: ['coup-de-pouce-chauffage', 'eco-ptz-pompe-a-chaleur', 'renovation-ampleur', 'plafonds-revenus-maprimerenov', 'rentabilite-pompe-a-chaleur'],
  sources: ['spMpr', 'coupDePouce', 'emmy', 'tva', 'ecoPtz'],
  fr: {
    slug: 'maprimerenov-rose',
    nav: 'MaPrimeRénov’ rose',
    card: 'Revenus supérieurs : pas de forfait pour une PAC, mais CEE, TVA réduite, éco-PTZ.',
    title: 'MaPrimeRénov’ rose 2026 : quelles aides pour une PAC ?',
    description: 'MaPrimeRénov’ rose 2026 : pas de forfait pour une pompe à chaleur, mais prime CEE avec Coup de pouce, TVA à 5,5 %, éco-PTZ et rénovation d’ampleur 2026.',
    h1: 'MaPrimeRénov’ rose : les aides qui restent pour une pompe à chaleur',
    intro: 'Réglage : 3 personnes et 90 000 € de revenu fiscal, catégorie rose. Le simulateur affiche donc le reste à charge avec la seule prime CEE.',
    resume: (h) => {
      const r = h.M.simuler({ ...h.M.DEFAUT, rfr: RFR });
      return `Au-dessus du plafond violet (${h.eur(h.M.plafondsRfr(3, false).violet)} pour trois personnes hors Île-de-France, ${h.eur(h.M.plafondsRfr(3, true).violet)} en Île-de-France), un ménage est classé rose. En 2026, le forfait MaPrimeRénov’ par geste d’un ménage rose est nul pour une pompe à chaleur, air/eau comme géothermique. Il reste trois aides. La prime CEE, avec le Coup de pouce si la PAC remplace une chaudière au gaz, au fioul ou au charbon : ${h.eur(r.cee.eur)} pour une maison de 100 m² dans le Rhône, au prix moyen du registre. La TVA à ${h.pct(h.P.tva.pac, 1)} au lieu de ${h.pct(h.P.tva.chaudiere_fossile, 0)}, dans un logement de plus de deux ans. Et l’éco-prêt à taux zéro, sans condition de revenus, jusqu’à ${h.eur(h.P.eco_ptz.une_action)} pour une seule action. Si la PAC fait partie d’une rénovation qui gagne au moins deux classes de DPE, MaPrimeRénov’ rénovation d’ampleur verse ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} du coût hors taxes plafonné. Le simulateur calcule le reste à charge et le temps de retour avec vos chiffres.`;
    },
    faqs: (h) => [
      { q: 'Un ménage rose a-t-il droit au Coup de pouce Chauffage ?', a: 'Oui, le Coup de pouce n’a pas de condition de revenus. Il faut une résidence principale, une chaudière individuelle au charbon, au fioul ou au gaz remplacée, un modèle de PAC agréé depuis le 1er septembre 2026 et une offre acceptée avant de signer le devis. Les certificats sont rachetés au prix classique.' },
      { q: 'Pourquoi le forfait rose est-il de zéro ?', a: 'Le barème de MaPrimeRénov’ par geste réserve les forfaits aux ménages bleus, jaunes et violets en 2026. Les ménages aux revenus supérieurs gardent l’accès à MaPrimeRénov’ rénovation d’ampleur, avec un taux plus faible, et aux aides sans condition de ressources comme la prime CEE, la TVA réduite et l’éco-prêt.' },
      { q: 'Une PAC est-elle rentable sans MaPrimeRénov’ ?', a: 'Cela dépend surtout de l’énergie remplacée et du climat. Au fioul ou à l’électricité directe dans un département froid, l’économie annuelle est forte et le temps de retour raisonnable. Au gaz dans un climat doux, il peut dépasser la durée de vie de l’appareil. La page rentabilité et le simulateur font le calcul avec votre département.' },
    ],
    body: (h) => `<h2>Aides et reste à charge d’un ménage rose</h2>
${tableCouleur(h, RFR)}
<p>Seule la prime CEE apparaît : MaPrimeRénov’ vaut zéro. La prime est calculée avec le Coup de pouce et le prix classique. Pour vérifier la ${h.a('rentabilite-pompe-a-chaleur', 'rentabilité')}, le simulateur compare la facture actuelle et celle de la PAC.</p>
<h2>Rénovation d’ampleur : une autre voie</h2>
<p>Si vous prévoyez aussi d’isoler, MaPrimeRénov’ rénovation d’ampleur finance un bouquet de travaux qui fait gagner au moins deux classes de DPE, avec un accompagnateur obligatoire. Pour un ménage rose, le taux est de ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} du coût hors taxes, dans la limite de ${h.eur(h.P.maprimerenov.ampleur.plafond_2_classes)} pour deux classes gagnées et ${h.eur(h.P.maprimerenov.ampleur.plafond_3_classes)} pour trois. Les détails sont sur la page ${h.a('renovation-ampleur', 'rénovation d’ampleur')}.</p>
<h2>Financer le reste</h2>
<p>L’${h.a('eco-ptz-pompe-a-chaleur', 'éco-prêt à taux zéro')} permet d’étaler le coût sur ${h.num(h.P.eco_ptz.duree_max_ans)} ans au plus, sans intérêts, quelle que soit la couleur.</p>`,
  },
  en: {
    slug: 'maprimerenov-pink',
    nav: 'MaPrimeRénov’ pink',
    card: 'Higher incomes: no flat rate for a heat pump, but CEE, reduced VAT, eco-loan.',
    title: 'MaPrimeRénov’ pink 2026: grants left for a heat pump',
    description: 'MaPrimeRénov’ pink in 2026: no flat rate for a heat pump, but the CEE bonus with Coup de pouce, 5.5% VAT, the zero-rate eco-loan and whole-home renovation.',
    h1: 'MaPrimeRénov’ pink: the grants left for a heat pump',
    intro: 'Setting: 3 people and €90,000 reference tax income, the pink band. The calculator therefore shows the out-of-pocket cost with the CEE bonus alone.',
    resume: (h) => {
      const r = h.M.simuler({ ...h.M.DEFAUT, rfr: RFR });
      return `Above the purple ceiling (${h.eur(h.M.plafondsRfr(3, false).violet)} for three people outside Île-de-France, ${h.eur(h.M.plafondsRfr(3, true).violet)} in Île-de-France), a household is classed pink. In 2026 a pink household’s per-item MaPrimeRénov’ flat rate is zero for a heat pump, air-to-water or ground-source. Three grants remain. The CEE bonus, with the Coup de pouce if the heat pump replaces a gas, oil or coal boiler: ${h.eur(r.cee.eur)} for a 100 m² house in the Rhône, at the registry average price. VAT at ${h.pct(h.P.tva.pac, 1)} instead of ${h.pct(h.P.tva.chaudiere_fossile, 0)}, in a home over two years old. And the zero-rate eco-loan, with no income condition, up to ${h.eur(h.P.eco_ptz.une_action)} for a single item. If the heat pump is part of a renovation gaining at least two energy-rating classes, whole-home MaPrimeRénov’ pays ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} of the capped cost before VAT. The calculator works out the out-of-pocket cost and payback with your figures.`;
    },
    faqs: (h) => [
      { q: 'Does a pink household qualify for the Coup de pouce Chauffage?', a: 'Yes, the Coup de pouce has no income condition. It requires a main residence, an individual coal, oil or gas boiler replaced, a heat pump model approved since 1 September 2026, and an offer accepted before signing the quote. The certificates are bought at the standard price.' },
      { q: 'Why is the pink flat rate zero?', a: 'The per-item MaPrimeRénov’ scale has reserved flat rates for blue, yellow and purple households in 2026. Higher-income households keep access to whole-home MaPrimeRénov’, at a lower rate, and to grants with no income condition such as the CEE bonus, reduced VAT and the eco-loan.' },
      { q: 'Does a heat pump pay off without MaPrimeRénov’?', a: 'It depends mostly on the energy replaced and the climate. Replacing oil or direct electric heating in a cold département, the yearly saving is large and payback reasonable. Replacing gas in a mild climate, payback can exceed the unit’s lifetime. The payback page and the calculator do the sums with your département.' },
    ],
    body: (h) => `<h2>Grants and out-of-pocket cost for a pink household</h2>
${tableCouleur(h, RFR)}
<p>Only the CEE bonus appears: MaPrimeRénov’ is zero. The bonus is calculated with the Coup de pouce at the standard price. To check the ${h.a('rentabilite-pompe-a-chaleur', 'payback')}, the calculator compares the current bill with the heat pump’s.</p>
<h2>Whole-home renovation: another route</h2>
<p>If you also plan to insulate, whole-home MaPrimeRénov’ funds a package of work gaining at least two energy-rating classes, with a mandatory adviser. For a pink household the rate is ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} of the cost before VAT, up to ${h.eur(h.P.maprimerenov.ampleur.plafond_2_classes)} for two classes gained and ${h.eur(h.P.maprimerenov.ampleur.plafond_3_classes)} for three. Details are on the ${h.a('renovation-ampleur', 'whole-home renovation')} page.</p>
<h2>Funding the rest</h2>
<p>The ${h.a('eco-ptz-pompe-a-chaleur', 'zero-rate eco-loan')} spreads the cost over ${h.num(h.P.eco_ptz.duree_max_ans)} years at most, interest-free, whatever your colour.</p>`,
  },
});
