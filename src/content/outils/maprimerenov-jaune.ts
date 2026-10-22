import { defineGuide } from '../../lib/guide-types';
import { tableCouleur } from '../../lib/couleur-pages';

const RFR = 35000;

export default defineGuide({
  id: 'maprimerenov-jaune',
  group: 'aides',
  order: 7,
  tool: 'simulateur',
  preset: { rfr: RFR, personnes: 3 },
  focus: 'mpr',
  related: ['plafonds-revenus-maprimerenov', 'maprimerenov-bleu', 'maprimerenov-violet', 'ecretement-maprimerenov', 'prime-cee-pompe-a-chaleur'],
  sources: ['spMpr', 'decret2020', 'emmy'],
  fr: {
    slug: 'maprimerenov-jaune',
    nav: 'MaPrimeRénov’ jaune',
    card: 'Ménages modestes : 4 000 € en air/eau, 9 000 € en géothermie, CEE précarité.',
    title: 'MaPrimeRénov’ jaune 2026 : pompe à chaleur, forfait et aides',
    description: 'MaPrimeRénov’ jaune 2026 pour une pompe à chaleur : forfait des ménages modestes, prime CEE au prix précarité, aides plafonnées à 75 % et reste à charge.',
    h1: 'MaPrimeRénov’ jaune : ce que touche un ménage modeste',
    intro: 'Réglage de départ : 3 personnes, 35 000 € de revenu fiscal, hors Île-de-France, soit la catégorie jaune. Saisissez vos propres revenus et votre devis.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits, p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      return `Un foyer de trois personnes est jaune, c’est-à-dire « modeste », entre ${h.eur(p.bleu + 1)} et ${h.eur(p.jaune)} de revenu fiscal de référence hors Île-de-France, et entre ${h.eur(q.bleu + 1)} et ${h.eur(q.jaune)} en Île-de-France. Pour une pompe à chaleur, le forfait MaPrimeRénov’ 2026 est de ${h.eur(F.air_eau.jaune)} en air/eau et ${h.eur(F.geo.jaune)} en géothermie, soit ${h.eur(F.air_eau.bleu - F.air_eau.jaune)} et ${h.eur(F.geo.bleu - F.geo.jaune)} de moins qu’un ménage bleu. La catégorie jaune garde un avantage souvent oublié : comme les ménages bleus, ses travaux génèrent des certificats « précarité énergétique », rachetés plus cher. Sa prime CEE avec Coup de pouce est donc la même que celle d’un ménage bleu. En revanche, son plafond d’aides est plus bas : ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)} de la dépense éligible, et ${h.pct(h.P.ecretement.reste_a_charge_min.jaune, 0)} au moins restent à sa charge. Avec une prime CEE élevée, c’est ce plafond qui fixe le montant de MaPrimeRénov’ réellement versé.`;
    },
    faqs: (h) => [
      { q: 'Je suis juste au-dessus du plafond bleu : que perd-on en passant jaune ?', a: `Le forfait baisse de ${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu - h.P.maprimerenov.forfaits.air_eau.jaune)} en air/eau, et le plafond d’aides passe de ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} à ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)} de la dépense. La prime CEE reste au prix précarité. Comme l’écrêtement joue souvent, l’écart réel de MaPrimeRénov’ versée dépend de votre devis : comparez les deux cas dans le simulateur.` },
      { q: 'Le forfait jaune est-il différent en Île-de-France ?', a: `Non : les forfaits MaPrimeRénov’ sont les mêmes partout en France métropolitaine, ${h.eur(h.P.maprimerenov.forfaits.air_eau.jaune)} en air/eau et ${h.eur(h.P.maprimerenov.forfaits.geo.jaune)} en géothermie pour un ménage jaune. Seuls les plafonds de revenus changent : ils sont plus hauts en Île-de-France, ce qui permet d’y être jaune avec un revenu qui classerait violet ailleurs.` },
      { q: 'Pourquoi ma prime CEE est-elle la même qu’un ménage bleu ?', a: `Parce que la règle des certificats « précarité » couvre les deux catégories, bleue et jaune. Au registre Emmy, ils se sont échangés en moyenne ${h.num(h.P.cee.prix_mwh.precarite, 2)} € le MWh cumac en ${h.moisCee}, contre ${h.num(h.P.cee.prix_mwh.classique, 2)} € pour les certificats classiques des ménages violets et roses.` },
    ],
    body: (h) => `<h2>Aides et reste à charge d’un ménage jaune</h2>
${tableCouleur(h, RFR)}
<p>Pour un devis d’air/eau modeste, la prime CEE au prix précarité, déjà proche du plafond de ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)}, laisse peu de place à MaPrimeRénov’. Pour la géothermie, dont le forfait est plus élevé, l’écrêtement est moins fort en proportion.</p>
<h2>Comment le vérifier sur votre avis d’impôt</h2>
<p>Le revenu fiscal de référence figure en première page de l’avis d’imposition, dans le cadre « Vos références ». Si deux avis concernent le logement (couple non marié, enfant majeur rattaché ailleurs qui vit chez vous), additionnez-les. Saisissez la somme dans le simulateur : il donne votre couleur et le plafond suivant.</p>
<h2>Bleu, jaune ou violet : les écarts</h2>
<p>Comparez avec les pages ${h.a('maprimerenov-bleu', 'MaPrimeRénov’ bleu')} et ${h.a('maprimerenov-violet', 'MaPrimeRénov’ violet')}, ou avec le tableau complet des ${h.a('plafonds-revenus-maprimerenov', 'plafonds de revenus')}.</p>`,
  },
  en: {
    slug: 'maprimerenov-yellow',
    nav: 'MaPrimeRénov’ yellow',
    card: 'Low incomes: €4,000 for air-to-water, €9,000 for ground-source, fuel-poverty CEE.',
    title: 'MaPrimeRénov’ yellow 2026: heat pump flat rate and grant cap',
    description: 'MaPrimeRénov’ yellow in 2026 for a heat pump: the low-income flat rate, the CEE bonus at the fuel-poverty price, grants capped at 75% and the net cost.',
    h1: 'MaPrimeRénov’ yellow: what a low-income household receives',
    intro: 'Starting setting: 3 people, €35,000 reference tax income, outside Île-de-France, which is the yellow band. Enter your own income and quote.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits, p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      return `A three-person household is yellow, meaning “low income”, between ${h.eur(p.bleu + 1)} and ${h.eur(p.jaune)} of reference tax income outside Île-de-France, and between ${h.eur(q.bleu + 1)} and ${h.eur(q.jaune)} in Île-de-France. For a heat pump the 2026 MaPrimeRénov’ flat rate is ${h.eur(F.air_eau.jaune)} for air-to-water and ${h.eur(F.geo.jaune)} for ground-source, which is ${h.eur(F.air_eau.bleu - F.air_eau.jaune)} and ${h.eur(F.geo.bleu - F.geo.jaune)} less than a blue household. The yellow band keeps an often forgotten advantage: like blue households, its work generates “fuel poverty” certificates, bought at a higher price. Its CEE bonus with Coup de pouce is therefore the same as a blue household’s. Its grant ceiling, however, is lower: ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)} of the eligible expense, with at least ${h.pct(h.P.ecretement.reste_a_charge_min.jaune, 0)} left to pay. With a high CEE bonus, this ceiling sets the MaPrimeRénov’ actually paid.`;
    },
    faqs: (h) => [
      { q: 'I am just above the blue ceiling: what do I lose by being yellow?', a: `The flat rate falls by ${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu - h.P.maprimerenov.forfaits.air_eau.jaune)} for air-to-water, and the grant ceiling drops from ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} to ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)} of the expense. The CEE bonus stays at the fuel-poverty price. As the cap often applies, the real gap in MaPrimeRénov’ paid depends on your quote: compare both cases in the calculator.` },
      { q: 'Is the yellow flat rate different in Île-de-France?', a: `No: MaPrimeRénov’ flat rates are the same throughout mainland France, ${h.eur(h.P.maprimerenov.forfaits.air_eau.jaune)} for air-to-water and ${h.eur(h.P.maprimerenov.forfaits.geo.jaune)} for ground-source for a yellow household. Only the income ceilings change: they are higher in Île-de-France, so you can be yellow there on an income that would make you purple elsewhere.` },
      { q: 'Why is my CEE bonus the same as a blue household’s?', a: `Because the “fuel poverty” certificate rule covers both bands, blue and yellow. On the Emmy registry they traded at an average of €${h.num(h.P.cee.prix_mwh.precarite, 2)} per MWh cumac in ${h.moisCee}, against €${h.num(h.P.cee.prix_mwh.classique, 2)} for the standard certificates of purple and pink households.` },
    ],
    body: (h) => `<h2>Grants and out-of-pocket cost for a yellow household</h2>
${tableCouleur(h, RFR)}
<p>For a modest air-to-water quote, the CEE bonus at the fuel-poverty price, already close to the ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)} ceiling, leaves little room for MaPrimeRénov’. For ground-source, whose flat rate is higher, the cut is smaller in proportion.</p>
<h2>How to check it on your tax notice</h2>
<p>Reference tax income appears on the first page of the tax notice, in the “Vos références” box. If two notices concern the home (an unmarried couple, an adult child attached elsewhere who lives with you), add them up. Enter the total in the calculator: it gives your colour and the next ceiling.</p>
<h2>Blue, yellow or purple: the gaps</h2>
<p>Compare with the ${h.a('maprimerenov-bleu', 'MaPrimeRénov’ blue')} and ${h.a('maprimerenov-violet', 'MaPrimeRénov’ purple')} pages, or with the full table of ${h.a('plafonds-revenus-maprimerenov', 'income ceilings')}.</p>`,
  },
});
