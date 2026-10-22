import { defineGuide } from '../../lib/guide-types';
import { tableCouleur } from '../../lib/couleur-pages';

const RFR = 20000;

export default defineGuide({
  id: 'maprimerenov-bleu',
  group: 'aides',
  order: 6,
  tool: 'simulateur',
  preset: { rfr: RFR, personnes: 3 },
  focus: 'mpr',
  related: ['plafonds-revenus-maprimerenov', 'maprimerenov-jaune', 'ecretement-maprimerenov', 'coup-de-pouce-chauffage', 'eco-ptz-pompe-a-chaleur'],
  sources: ['spMpr', 'decret2020', 'emmy', 'coupDePouce'],
  fr: {
    slug: 'maprimerenov-bleu',
    nav: 'MaPrimeRénov’ bleu',
    card: 'Ménages très modestes : 5 000 € en air/eau, avance, prime CEE précarité.',
    title: 'MaPrimeRénov’ bleu 2026 : pompe à chaleur, montant et avance',
    description: 'MaPrimeRénov’ bleu 2026 pour une pompe à chaleur : forfait des ménages très modestes, avance jusqu’à 50 %, prime CEE au prix précarité, écrêtement à 90 %.',
    h1: 'MaPrimeRénov’ bleu : pompe à chaleur pour un ménage très modeste',
    intro: `Le simulateur est réglé sur un foyer de 3 personnes avec 20 000 € de revenu fiscal, hors Île-de-France : catégorie bleue. Changez les chiffres pour les vôtres.`,
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits, p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      return `La catégorie bleue réunit les ménages aux revenus très modestes : jusqu’à ${h.eur(p.bleu)} de revenu fiscal de référence pour trois personnes hors Île-de-France, ${h.eur(q.bleu)} en Île-de-France. C’est elle qui reçoit les forfaits MaPrimeRénov’ les plus élevés pour une pompe à chaleur en 2026 : ${h.eur(F.air_eau.bleu)} en air/eau et ${h.eur(F.geo.bleu)} en géothermie. Trois avantages s’y ajoutent. L’Anah peut verser une avance, jusqu’à ${h.pct(h.P.maprimerenov.avance_bleu_max, 0)} de la prime, pour éviter d’avancer tout le prix. La prime CEE se rachète au prix « précarité », plus élevé que le prix classique. Et le plafond d’écrêtement est le plus haut : les aides peuvent couvrir jusqu’à ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} de la dépense. Mais avec le Coup de pouce, la prime CEE seule peut déjà dépasser la moitié du devis, si bien que MaPrimeRénov’ est en pratique souvent réduite. Le simulateur calcule le montant réellement versé.`;
    },
    faqs: (h) => [
      { q: 'Comment obtenir l’avance de MaPrimeRénov’ ?', a: `En la demandant lors du dépôt du dossier sur le site de l’Anah, une fois la demande acceptée. Réservée aux ménages bleus, elle peut atteindre ${h.pct(h.P.maprimerenov.avance_bleu_max, 0)} de la prime. Le solde est versé après les travaux, sur la facture. Gardez-la de côté pour régler l’acompte de l’installateur, et vérifiez sur votre espace Anah que la demande d’avance a bien été enregistrée.` },
      { q: 'Avec 90 % d’aides, une PAC peut-elle presque ne rien coûter ?', a: `En théorie oui, sur un devis modeste : le reste à charge minimal d’un ménage bleu est de ${h.pct(h.P.ecretement.reste_a_charge_min.bleu, 0)} de la dépense éligible. Mais la dépense au-delà du plafond (${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)} en air/eau) reste entièrement à payer. Méfiez-vous des offres « à 1 € » : elles cachent souvent un prix gonflé ou une installation au rabais.` },
      { q: 'Un ménage bleu peut-il aussi avoir l’éco-prêt à taux zéro ?', a: `Oui. L’éco-PTZ finance le reste à charge sans intérêts, jusqu’à ${h.eur(h.P.eco_ptz.une_action)} pour une seule action comme une PAC, sur ${h.num(h.P.eco_ptz.duree_max_ans)} ans au plus. Il se cumule avec MaPrimeRénov’ et la prime CEE, sans entrer dans le plafond d’écrêtement puisqu’il s’agit d’un prêt.` },
    ],
    body: (h) => `<h2>Aides et reste à charge d’un ménage bleu</h2>
${tableCouleur(h, RFR)}
<p>En air/eau, la prime CEE au prix « précarité » (${h.num(h.P.cee.prix_mwh.precarite, 2)} € le MWh cumac en moyenne en ${h.moisCee}) dépasse le forfait MaPrimeRénov’ ; en géothermie, elle en approche. L’écrêtement réduit alors MaPrimeRénov’ dans les quatre cas : la somme des aides est plafonnée à ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} de la dépense éligible.</p>
<h2>Un accompagnement gratuit</h2>
<p>Les conseillers France Rénov’ sont gratuits pour tous ; pour un ménage bleu, ils aident aussi à monter le dossier et à vérifier les devis. Commencez par eux avant de signer quoi que ce soit, en particulier si une entreprise vous démarche par téléphone en promettant une PAC presque gratuite.</p>
<h2>Si vous êtes en Île-de-France</h2>
<p>Les plafonds y sont plus hauts : vous pouvez être bleu avec un revenu qui, ailleurs, vous classerait jaune. Choisissez votre département dans le simulateur, il applique le bon barème.</p>`,
  },
  en: {
    slug: 'maprimerenov-blue',
    nav: 'MaPrimeRénov’ blue',
    card: 'Very low incomes: €5,000 for air-to-water, advance, fuel-poverty CEE price.',
    title: 'MaPrimeRénov’ blue 2026: heat pump grant and advance payment',
    description: 'MaPrimeRénov’ blue in 2026 for a heat pump: the very-low-income flat rate, an advance of up to 50%, the CEE bonus at the fuel-poverty price, and the 90% cap.',
    h1: 'MaPrimeRénov’ blue: a heat pump for a very-low-income household',
    intro: 'The calculator is set to a 3-person household with €20,000 reference tax income outside Île-de-France: the blue band. Change the figures to yours.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits, p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      return `The blue band covers very-low-income households: up to ${h.eur(p.bleu)} of reference tax income for three people outside Île-de-France, ${h.eur(q.bleu)} in Île-de-France. It receives the highest MaPrimeRénov’ flat rates for a heat pump in 2026: ${h.eur(F.air_eau.bleu)} for air-to-water and ${h.eur(F.geo.bleu)} for ground-source. Three advantages come on top. Anah can pay an advance, up to ${h.pct(h.P.maprimerenov.avance_bleu_max, 0)} of the grant, so you do not have to front the whole price. The CEE bonus is bought at the “fuel poverty” price, higher than the standard one. And the cap is the highest: grants can cover up to ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} of the expense. But with the Coup de pouce, the CEE bonus alone can already exceed half the quote, so in practice MaPrimeRénov’ is often reduced. The calculator works out the amount actually paid.`;
    },
    faqs: (h) => [
      { q: 'How do I get the MaPrimeRénov’ advance?', a: `By asking for it when filing on the Anah website, once the application is accepted. Reserved for blue households, it can reach ${h.pct(h.P.maprimerenov.avance_bleu_max, 0)} of the grant. The balance is paid after the work, on the invoice. Keep it for the installer’s deposit, and check in your Anah account that the advance request has been recorded.` },
      { q: 'With 90% grants, can a heat pump cost almost nothing?', a: `In theory yes, on a modest quote: a blue household’s minimum out-of-pocket share is ${h.pct(h.P.ecretement.reste_a_charge_min.bleu, 0)} of the eligible expense. But spending above the ceiling (${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)} for air-to-water) is paid in full. Beware of “€1” offers: they often hide an inflated price or a cut-price installation.` },
      { q: 'Can a blue household also get the zero-rate eco-loan?', a: `Yes. The eco-PTZ funds the out-of-pocket cost interest-free, up to ${h.eur(h.P.eco_ptz.une_action)} for a single item such as a heat pump, over ${h.num(h.P.eco_ptz.duree_max_ans)} years at most. It combines with MaPrimeRénov’ and the CEE bonus, and does not count towards the cap since it is a loan.` },
    ],
    body: (h) => `<h2>Grants and out-of-pocket cost for a blue household</h2>
${tableCouleur(h, RFR)}
<p>For air-to-water, the CEE bonus at the fuel-poverty price (an average €${h.num(h.P.cee.prix_mwh.precarite, 2)} per MWh cumac in ${h.moisCee}) exceeds the MaPrimeRénov’ flat rate; for ground-source it comes close. The cap then reduces MaPrimeRénov’ in all four cases: total grants are limited to ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} of the eligible expense.</p>
<h2>Free guidance</h2>
<p>France Rénov’ advisers are free for everyone; for a blue household they also help put the file together and check quotes. Start with them before signing anything, especially if a firm cold-calls you promising an almost free heat pump.</p>
<h2>If you live in Île-de-France</h2>
<p>Ceilings there are higher: you can be blue on an income that would make you yellow elsewhere. Choose your département in the calculator and it applies the right scale.</p>`,
  },
});
