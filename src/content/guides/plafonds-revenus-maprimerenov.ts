import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Plafonds de revenu fiscal de référence 2026 par taille de foyer (paramètres Anah). */
const plafonds = (h: Helpers, idf: boolean) => {
  const fr = h.lang === 'fr';
  const rows = [1, 2, 3, 4, 5, 6].map((n) => { const p = h.M.plafondsRfr(n, idf); return [fr ? `${n} personne${n > 1 ? 's' : ''}` : `${n} ${n > 1 ? 'people' : 'person'}`, h.eur(p.bleu), h.eur(p.jaune), h.eur(p.violet), fr ? `plus de ${h.eur(p.violet)}` : `over ${h.eur(p.violet)}`]; });
  return h.table(fr ? ['Foyer', 'Bleu jusqu’à', 'Jaune jusqu’à', 'Violet jusqu’à', 'Rose'] : ['Household', 'Blue up to', 'Yellow up to', 'Purple up to', 'Pink'], rows,
    fr ? `Revenu fiscal de référence 2026, ${idf ? 'Île-de-France' : 'hors Île-de-France'} ; au-delà de 5 personnes, ajouter ${h.eur(idf ? h.P.plafonds_rfr.idf.bleu.plus : h.P.plafonds_rfr.hors_idf.bleu.plus)} (bleu) par personne`
       : `2026 reference tax income, ${idf ? 'Île-de-France' : 'outside Île-de-France'}; above 5 people, add ${h.eur(idf ? h.P.plafonds_rfr.idf.bleu.plus : h.P.plafonds_rfr.hors_idf.bleu.plus)} (blue) per person`, ['l', 'r', 'r', 'r', 'r']);
};

const forfaits = (h: Helpers) => {
  const fr = h.lang === 'fr', F = h.P.maprimerenov.forfaits;
  const c = ['bleu', 'jaune', 'violet', 'rose'] as const;
  return h.table(fr ? ['Couleur', 'PAC air/eau', 'PAC géothermique', 'Reste à charge minimal'] : ['Colour', 'Air-to-water', 'Ground-source', 'Minimum out-of-pocket'],
    c.map((k) => [fr ? { bleu: 'Bleu', jaune: 'Jaune', violet: 'Violet', rose: 'Rose' }[k] : { bleu: 'Blue', jaune: 'Yellow', violet: 'Purple', rose: 'Pink' }[k], h.eur(F.air_eau[k]), h.eur(F.geo[k]), h.pct(h.P.ecretement.reste_a_charge_min[k], 0)]),
    fr ? 'MaPrimeRénov’ par geste 2026 et part minimale de la dépense payée par le ménage (écrêtement)' : '2026 per-item MaPrimeRénov’ and the minimum share of the expense paid by the household (cap)', ['l', 'r', 'r', 'r']);
};

/** Supplément de plafond par personne au-delà de cinq (barème Anah 2026). */
const parPersonne = (h: Helpers) => {
  const fr = h.lang === 'fr', T = h.P.plafonds_rfr;
  const rows = (['bleu', 'jaune', 'violet'] as const).map((c) => [fr ? { bleu: 'Bleu', jaune: 'Jaune', violet: 'Violet' }[c] : { bleu: 'Blue', jaune: 'Yellow', violet: 'Purple' }[c], h.eur(T.hors_idf[c].plus), h.eur(T.idf[c].plus)]);
  return h.table(fr ? ['Couleur', 'Hors Île-de-France', 'Île-de-France'] : ['Colour', 'Outside Île-de-France', 'Île-de-France'], rows,
    fr ? 'Montant ajouté au plafond de cinq personnes pour chaque personne en plus' : 'Amount added to the five-person ceiling for each extra person', ['l', 'r', 'r']);
};

export default defineGuide({
  id: 'plafonds-revenus-maprimerenov',
  group: 'aides',
  order: 2,
  mini: 'couleur',
  related: ['maprimerenov-bleu', 'maprimerenov-jaune', 'maprimerenov-violet', 'maprimerenov-rose', 'maprimerenov-pompe-a-chaleur', 'ecretement-maprimerenov'],
  sources: ['spMpr', 'decret2020'],
  fr: {
    slug: 'plafonds-revenus-maprimerenov',
    nav: 'Plafonds de revenus 2026',
    card: 'Bleu, jaune, violet ou rose : votre couleur selon le revenu fiscal.',
    title: 'Plafonds de revenus MaPrimeRénov’ 2026 : bleu, jaune, violet',
    description: 'Plafonds de revenus MaPrimeRénov’ 2026 : barèmes bleu, jaune, violet et rose selon le revenu fiscal de référence et la taille du foyer, Île-de-France ou non.',
    h1: 'Plafonds de revenus MaPrimeRénov’ 2026 : trouver sa couleur',
    intro: 'Votre couleur fixe le montant de MaPrimeRénov’, le taux de rachat des CEE et la part que vous paierez au minimum. Elle se lit sur votre avis d’impôt.',
    resume: (h) => {
      const p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      return `MaPrimeRénov’ classe les ménages en quatre catégories de revenus, désignées par une couleur : bleu (très modestes), jaune (modestes), violet (intermédiaires) et rose (supérieurs). La couleur dépend du revenu fiscal de référence du foyer, inscrit sur l’avis d’imposition, du nombre de personnes qui y vivent, et du lieu du logement : les plafonds sont plus élevés en Île-de-France. Pour un foyer de trois personnes hors Île-de-France, on est bleu jusqu’à ${h.eur(p.bleu)}, jaune jusqu’à ${h.eur(p.jaune)}, violet jusqu’à ${h.eur(p.violet)}, rose au-delà ; en Île-de-France, les seuils sont ${h.eur(q.bleu)}, ${h.eur(q.jaune)} et ${h.eur(q.violet)}. Le plafond est inclus : un revenu égal au seuil reste dans la catégorie. La couleur règle trois choses pour une pompe à chaleur : le forfait MaPrimeRénov’ (${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu)} pour un ménage bleu en air/eau, rien pour un rose), le prix de rachat de la prime CEE (« précarité » pour bleu et jaune) et la part minimale de la dépense que le ménage paie lui-même.`;
    },
    faqs: (h) => [
      { q: 'Quel avis d’impôt utiliser pour MaPrimeRénov’ en 2026 ?', a: 'Le dernier avis disponible au moment du dépôt de la demande, soit en 2026 l’avis reçu en 2026 sur les revenus de 2025. Si plusieurs foyers fiscaux vivent dans le logement, par exemple un couple non marié, on additionne les revenus fiscaux de référence de chacun. Le nombre de personnes est celui des occupants du logement.' },
      { q: 'Que se passe-t-il si mon revenu est égal au plafond ?', a: 'Vous restez dans la catégorie : les plafonds sont des maximums inclus. Un foyer de trois personnes hors Île-de-France qui déclare exactement le plafond bleu est bleu. Un euro de plus le fait passer jaune. Le simulateur du site applique la même règle.' },
      { q: 'Un ménage rose a-t-il droit à une aide pour une pompe à chaleur ?', a: `Pas à MaPrimeRénov’ par geste : le forfait rose vaut ${h.eur(h.P.maprimerenov.forfaits.air_eau.rose)} en 2026. Il garde la prime CEE, avec le Coup de pouce s’il remplace une chaudière au gaz ou au fioul, la TVA à 5,5 % et l’éco-prêt à taux zéro. En rénovation d’ampleur, MaPrimeRénov’ lui verse ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} du coût hors taxes plafonné.` },
    ],
    body: (h) => `<h2>Les plafonds hors Île-de-France</h2>
${plafonds(h, false)}
<h2>Les plafonds en Île-de-France</h2>
<p>Paris, les Hauts-de-Seine, la Seine-Saint-Denis, le Val-de-Marne, la Seine-et-Marne, les Yvelines, l’Essonne et le Val-d’Oise ont leur propre barème, plus élevé :</p>
${plafonds(h, true)}
<!--mini:couleur-->
<h2>Ce que change la couleur</h2>
<p>Le forfait MaPrimeRénov’ et la part minimale que le ménage paie lui-même dépendent directement de la couleur :</p>
${forfaits(h)}
<p>La règle du reste à charge minimal s’appelle l’écrêtement : toutes les aides publiques et la prime CEE réunies ne peuvent pas dépasser ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} de la dépense pour un ménage bleu, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)} pour un jaune, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} pour un violet. Si c’est le cas, c’est MaPrimeRénov’ qui baisse. La page ${h.a('ecretement-maprimerenov', 'écrêtement')} en donne des exemples chiffrés.</p>
<h2>Au-delà de cinq personnes</h2>
${parPersonne(h)}
<p>Le revenu retenu est le revenu fiscal de référence de l’avis d’impôt, pour toutes les personnes qui vivent dans le logement. Un enfant majeur rattaché ou un parent hébergé compte dans le nombre de personnes.</p>
<h2>La prime CEE suit aussi la couleur</h2>
<p>Les ménages bleus et jaunes sont « en précarité énergétique » au sens des certificats d’économies d’énergie. Leurs certificats se revendent plus cher : au registre Emmy, ${h.num(h.P.cee.prix_mwh.precarite, 2)} € le mégawattheure cumac en ${h.moisCee} contre ${h.num(h.P.cee.prix_mwh.classique, 2)} € pour les autres. Pour une PAC air/eau avec Coup de pouce dans une maison de 100 m² en zone H2, la différence dépasse ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'bleu' }).eur - h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'violet' }).eur)} au prix moyen, mais chaque fournisseur fixe son propre prix.</p>
<h2>Les pages par couleur</h2>
<p>Chaque couleur a sa page avec le simulateur réglé sur un revenu type et un foyer de trois personnes : ${h.a('maprimerenov-bleu', 'bleu')}, ${h.a('maprimerenov-jaune', 'jaune')}, ${h.a('maprimerenov-violet', 'violet')} et ${h.a('maprimerenov-rose', 'rose')}.</p>
<h2>Les autres conditions</h2>
<p>Être propriétaire occupant (ou bailleur, sous engagement de louer ${h.num(h.P.maprimerenov.location_annees)} ans) ; un logement achevé depuis plus de ${h.num(h.P.maprimerenov.anciennete_logement_ans_pac)} ans pour une PAC ; un installateur RGE ; une demande déposée avant de commencer les travaux, sur le site de l’Anah. Le montant total des aides MaPrimeRénov’ par geste est plafonné à ${h.eur(h.P.maprimerenov.plafond_cumul_5_ans)} par logement sur cinq ans.</p>`,
  },
  en: {
    slug: 'maprimerenov-income-ceilings',
    nav: '2026 income ceilings',
    card: 'Blue, yellow, purple or pink: your colour from your tax income.',
    title: 'MaPrimeRénov’ income ceilings 2026: blue, yellow and purple',
    description: 'MaPrimeRénov’ income ceilings for 2026: blue, yellow, purple and pink bands by reference tax income and household size, in Île-de-France or elsewhere in France.',
    h1: 'MaPrimeRénov’ 2026 income ceilings: finding your colour',
    intro: 'Your colour sets the MaPrimeRénov’ amount, the CEE buy-back price and the minimum share you will pay. It is read from your tax notice.',
    resume: (h) => {
      const p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      return `MaPrimeRénov’ sorts households into four income bands, each named by a colour: blue (very low income), yellow (low), purple (middle) and pink (higher). The colour depends on the household’s reference tax income, shown on the tax notice, the number of people living there, and where the home is: ceilings are higher in Île-de-France. For a three-person household outside Île-de-France, you are blue up to ${h.eur(p.bleu)}, yellow up to ${h.eur(p.jaune)}, purple up to ${h.eur(p.violet)}, pink above; in Île-de-France the thresholds are ${h.eur(q.bleu)}, ${h.eur(q.jaune)} and ${h.eur(q.violet)}. The ceiling is inclusive: an income equal to the threshold stays in the band. The colour sets three things for a heat pump: the MaPrimeRénov’ flat rate (${h.eur(h.P.maprimerenov.forfaits.air_eau.bleu)} for a blue household for air-to-water, nothing for pink), the CEE buy-back price (“fuel poverty” for blue and yellow) and the minimum share of the expense the household pays itself.`;
    },
    faqs: (h) => [
      { q: 'Which tax notice counts for MaPrimeRénov’ in 2026?', a: 'The latest notice available when the application is filed, which in 2026 is the notice received in 2026 on 2025 income. If several tax households live in the home, such as an unmarried couple, their reference tax incomes are added together. The number of people is the number of occupants of the home.' },
      { q: 'What if my income equals the ceiling?', a: 'You stay in the band: the ceilings are inclusive maximums. A three-person household outside Île-de-France declaring exactly the blue ceiling is blue. One euro more makes it yellow. The site’s calculator applies the same rule, and so do the per-colour pages below.' },
      { q: 'Does a pink household get any help for a heat pump?', a: `Not per-item MaPrimeRénov’: the pink flat rate is ${h.eur(h.P.maprimerenov.forfaits.air_eau.rose)} in 2026. It keeps the CEE bonus, with the Coup de pouce if it replaces a gas or oil boiler, 5.5% VAT and the zero-rate eco-loan. For a whole-home renovation, MaPrimeRénov’ pays it ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} of the capped cost before VAT.` },
    ],
    body: (h) => `<h2>Ceilings outside Île-de-France</h2>
${plafonds(h, false)}
<h2>Ceilings in Île-de-France</h2>
<p>Paris, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Seine-et-Marne, Yvelines, Essonne and Val-d’Oise have their own, higher scale:</p>
${plafonds(h, true)}
<!--mini:couleur-->
<h2>What the colour changes</h2>
<p>The MaPrimeRénov’ flat rate and the minimum share the household pays itself depend directly on the colour:</p>
${forfaits(h)}
<p>The minimum out-of-pocket rule is called the cap: all public grants and the CEE bonus together cannot exceed ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} of the expense for a blue household, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)} for yellow, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} for purple. If they do, MaPrimeRénov’ is reduced. The ${h.a('ecretement-maprimerenov', 'grant cap')} page gives worked examples.</p>
<h2>Beyond five people</h2>
${parPersonne(h)}
<p>The income used is the reference tax income on the tax notice, for everyone living in the home. An adult child attached to the household or a parent living with you counts in the number of people. Add up the reference tax incomes of every tax notice in the household before comparing them with the table: two unmarried partners each have their own notice, and both count.</p>
<p>The notice used is the most recent one available when you apply: in 2026, the notice issued in 2026 on 2025 income. If your situation has changed since, for a birth, a separation or a fall in income, ask a France Rénov’ adviser which notice and which household size to declare, before applying rather than after. Being one euro over a ceiling moves you to the next colour, so check the exact figure on the notice, not a rounded amount.</p>
<h2>The CEE bonus follows the colour too</h2>
<p>Blue and yellow households count as “in fuel poverty” for energy saving certificates. Their certificates sell for more: on the Emmy registry, €${h.num(h.P.cee.prix_mwh.precarite, 2)} per MWh cumac in ${h.moisCee} against €${h.num(h.P.cee.prix_mwh.classique, 2)} for others. For an air-to-water heat pump with Coup de pouce in a 100 m² house in zone H2, the gap exceeds ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'bleu' }).eur - h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'violet' }).eur)} at the average price, but each supplier sets its own price.</p>
<h2>Pages by colour</h2>
<p>Each colour has a page with the calculator set to a typical income and a three-person household: ${h.a('maprimerenov-bleu', 'blue')}, ${h.a('maprimerenov-jaune', 'yellow')}, ${h.a('maprimerenov-violet', 'purple')} and ${h.a('maprimerenov-rose', 'pink')}.</p>
<h2>Other conditions</h2>
<p>Being an owner-occupier (or a landlord, committing to let for ${h.num(h.P.maprimerenov.location_annees)} years); a home completed more than ${h.num(h.P.maprimerenov.anciennete_logement_ans_pac)} years ago for a heat pump; an RGE-certified installer; an application filed before work starts, on the Anah website. Total per-item MaPrimeRénov’ is capped at ${h.eur(h.P.maprimerenov.plafond_cumul_5_ans)} per home over five years.</p>`,
  },
});
