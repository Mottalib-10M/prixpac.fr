import { defineGuide, type Helpers } from '../../lib/guide-types';

type Cas = { fr: string; en: string; type: 'air_eau' | 'geo'; rfr: number; devis: number };
const CAS: Cas[] = [
  { fr: 'Air/eau, bleu, devis 12 000 €', en: 'Air-to-water, blue, €12,000 quote', type: 'air_eau', rfr: 20000, devis: 12000 },
  { fr: 'Air/eau, violet, devis 9 000 €', en: 'Air-to-water, purple, €9,000 quote', type: 'air_eau', rfr: 50000, devis: 9000 },
  { fr: 'Air/eau, violet, devis 15 788 €', en: 'Air-to-water, purple, €15,788 quote', type: 'air_eau', rfr: 50000, devis: 15788 },
  { fr: 'Géothermie, violet, devis 18 000 €', en: 'Ground-source, purple, €18,000 quote', type: 'geo', rfr: 50000, devis: 18000 },
  { fr: 'Géothermie, jaune, devis 14 000 €', en: 'Ground-source, yellow, €14,000 quote', type: 'geo', rfr: 35000, devis: 14000 },
];

const exemples = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = CAS.map((c) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, type: c.type, rfr: c.rfr, prixTtc: c.devis });
    const e = h.M.ecreter(r.forfait, r.cee.eur, r.prixTtc, h.M.plafondDepense(c.type), r.couleur);
    return [fr ? c.fr : c.en, h.eur(e.maxAides), h.eur(r.cee.eur), h.eur(r.forfait), h.eur(r.mpr), r.ecrete > 0 ? `−${h.eur(r.ecrete)}` : '—'];
  });
  return h.table(fr ? ['Cas', 'Aides maximales', 'Prime CEE', 'Forfait MPR', 'MPR versée', 'Écrêtement'] : ['Case', 'Maximum grants', 'CEE bonus', 'MPR flat rate', 'MPR paid', 'Cut'], rows,
    fr ? `Maison de 100 m² dans le Rhône (zone H1), chaudière gaz remplacée, Coup de pouce, foyer de 3 personnes ; prime CEE au prix moyen Emmy de ${h.moisCee}` : `100 m² house in the Rhône (zone H1), gas boiler replaced, Coup de pouce, 3-person household; CEE bonus at the ${h.moisCee} Emmy average price`, ['l', 'r', 'r', 'r', 'r', 'r']);
};

/** Plafond de toutes les aides selon le devis et la couleur (décret 2020-26, moteur du site). */
const plafondsAides = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const cs = ['bleu', 'jaune', 'violet', 'rose'] as const;
  const rows = [8000, 12000, 16000].map((ttc) => [h.eur(ttc), ...cs.map((c) => h.eur(h.M.ecreter(0, 0, ttc, h.P.maprimerenov.forfaits.air_eau.plafond_depense, c).maxAides))]);
  return h.table(fr ? ['Devis TTC', 'Bleu', 'Jaune', 'Violet', 'Rose'] : ['Quote incl. VAT', 'Blue', 'Yellow', 'Purple', 'Pink'], rows,
    fr ? `Total maximal MaPrimeRénov’ + CEE + aides locales pour une PAC air/eau (dépense plafonnée à ${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)})` : `Maximum total of MaPrimeRénov’ + CEE + local grants for an air-to-water heat pump (expense capped at ${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)})`, ['r', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'ecretement-maprimerenov',
  group: 'aides',
  order: 3,
  mini: 'mpr',
  related: ['maprimerenov-pompe-a-chaleur', 'prime-cee-pompe-a-chaleur', 'plafonds-revenus-maprimerenov', 'maprimerenov-violet', 'pompe-a-chaleur-geothermique'],
  sources: ['decret2020', 'spMpr', 'bar171', 'emmy'],
  fr: {
    slug: 'ecretement-maprimerenov',
    nav: 'Écrêtement MaPrimeRénov’',
    card: 'Quand la prime CEE fait baisser MaPrimeRénov’ : la règle et des cas chiffrés.',
    title: 'Écrêtement MaPrimeRénov’ 2026 : quand la prime CEE la réduit',
    description: 'Écrêtement de MaPrimeRénov’ en 2026 : aides plafonnées à 90, 75 ou 60 % de la dépense selon la couleur, effet de la prime CEE et exemples pour une PAC.',
    h1: 'Écrêtement de MaPrimeRénov’ : la règle et des exemples chiffrés',
    intro: 'Les sites additionnent MaPrimeRénov’ et la prime CEE. La loi plafonne leur somme : au-delà, MaPrimeRénov’ baisse. Voici de combien.',
    resume: (h) => {
      const E = h.P.ecretement.reste_a_charge_min;
      return `L’écrêtement est la règle qui empêche les aides de couvrir toute la dépense. Le décret n° 2020-26 du 14 janvier 2020 fixe un plafond : MaPrimeRénov’, la prime CEE et les autres aides publiques réunies ne peuvent pas dépasser ${h.pct(1 - E.bleu, 0)} de la dépense éligible pour un ménage bleu, ${h.pct(1 - E.jaune, 0)} pour un jaune et ${h.pct(1 - E.violet, 0)} pour un violet. La dépense éligible est le montant TTC du devis, dans la limite du plafond de dépense du geste : ${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)} pour une PAC air/eau, ${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)} pour une géothermique. Si la somme dépasse, c’est MaPrimeRénov’ qui est réduite, jamais la prime CEE. Avec le Coup de pouce, qui quintuple la prime CEE, l’écrêtement touche presque tous les dossiers, d’autant plus que le devis est bas : un ménage violet qui fait poser une PAC air/eau à ${h.eur(9000)} peut perdre une grande partie de son forfait. Le simulateur du site applique cette règle et affiche le montant écrêté.`;
    },
    faqs: (h) => [
      { q: 'Quand l’écrêtement est-il appliqué ?', a: 'Au moment du paiement de MaPrimeRénov’, sur la facture réelle et les aides déclarées. L’Anah demande le montant de la prime CEE et des autres aides au dépôt du dossier, puis recalcule sur la facture. Si votre facture finale est plus basse que le devis, l’écrêtement peut augmenter : la prime versée peut être inférieure à celle annoncée à l’accord.' },
      { q: 'Peut-on éviter l’écrêtement en renonçant à la prime CEE ?', a: 'C’est possible mais rarement intéressant : l’écrêtement réduit MaPrimeRénov’ du montant exact qui dépasse le plafond, donc le total des aides reste le même. Renoncer à la prime CEE fait perdre son montant sans rien gagner. Le cas se discute seulement si la prime CEE proposée est très basse.' },
      { q: 'Un ménage rose est-il concerné par l’écrêtement ?', a: `Le forfait rose est nul pour une pompe à chaleur en 2026, donc il n’y a rien à écrêter. Le plafond de ${h.pct(1 - h.P.ecretement.reste_a_charge_min.rose, 0)} de la dépense existe pour les autres gestes et la rénovation d’ampleur. La prime CEE, elle, n’est jamais réduite par l’écrêtement de MaPrimeRénov’.` },
    ],
    body: (h) => `<h2>La règle, en une formule</h2>
<p>MaPrimeRénov’ versée = le plus petit de deux montants : le forfait de votre couleur, ou (part maximale × dépense éligible) − prime CEE − autres aides. La part maximale vaut ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)}, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)}, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} ou ${h.pct(1 - h.P.ecretement.reste_a_charge_min.rose, 0)} selon la couleur. La dépense éligible est le devis TTC, plafonné. La règle vient de l’article 3 du ${h.src('decret2020', 'décret n° 2020-26')}.</p>
<h2>Cinq cas chiffrés</h2>
${exemples(h)}
<p>Dans les cinq cas, MaPrimeRénov’ est réduite. Le ménage bleu a le plafond d’aides le plus élevé, mais aussi la prime CEE la plus forte, rachetée au prix « précarité » : à elle seule, elle couvre plus de la moitié de la dépense. Le ménage violet avec un devis bas perd presque tout son forfait, parce que la prime CEE avec Coup de pouce occupe déjà presque tout son plafond. Avec un devis plus élevé, le plafond monte et l’écrêtement diminue. Le Coup de pouce rend donc l’écrêtement banal : c’est la règle, pas l’exception.</p>
<!--mini:mpr-->
<h2>Le plafond d’aides, devis par devis</h2>
${plafondsAides(h)}
<p>Au-delà du plafond de dépense, le plafond d’aides ne monte plus : un devis plus cher n’apporte pas d’aide en plus. Comparez ce montant à la prime CEE annoncée sur le devis pour savoir ce qui restera de MaPrimeRénov’.</p>
<h2>Ce que cela change pour votre choix</h2>
<p>Un devis moins cher reste moins cher : l’écrêtement réduit les aides, mais jamais au point de rendre un devis bas plus coûteux qu’un devis haut. En revanche, il rend fausses les publicités qui annoncent « jusqu’à X € de MaPrimeRénov’ plus Y € de prime ». Regardez le reste à charge, calculé par le simulateur, plutôt que la somme des aides.</p>
<h2>Les autres aides comptent aussi</h2>
<p>Les aides des collectivités (région, département, commune) entrent dans le plafond. Si vous en recevez une, ajoutez-la dans votre calcul : elle peut réduire MaPrimeRénov’ du même montant. L’éco-prêt à taux zéro, qui est un prêt et non une subvention, n’entre pas dans le plafond.</p>
<h2>Et en 2027 ?</h2>
<p>Le ${h.src('plf2027', 'projet de loi de finances pour 2027')}, non voté au ${h.date(h.today)}, prévoit que les pompes à chaleur soient « uniquement financées par les certificats d’économie d’énergie ». S’il est adopté en l’état, la question de l’écrêtement d’une PAC par geste disparaîtrait avec MaPrimeRénov’ elle-même. C’est à venir : rien n’est décidé.</p>`,
  },
  en: {
    slug: 'maprimerenov-grant-cap',
    nav: 'MaPrimeRénov’ grant cap',
    card: 'When the CEE bonus lowers MaPrimeRénov’: the rule and worked cases.',
    title: 'MaPrimeRénov’ grant cap 2026: when the CEE bonus cuts it',
    description: 'The MaPrimeRénov’ grant cap in 2026: total grants limited to 90, 75 or 60% of the expense by colour, how the CEE bonus counts, and worked heat pump examples.',
    h1: 'The MaPrimeRénov’ grant cap: the rule and worked examples',
    intro: 'Many sites add MaPrimeRénov’ and the CEE bonus together. The law caps their total: above it, MaPrimeRénov’ falls. Here is by how much.',
    resume: (h) => {
      const E = h.P.ecretement.reste_a_charge_min;
      return `The grant cap (“écrêtement”) is the rule that stops grants covering the whole expense. Decree no. 2020-26 of 14 January 2020 sets a ceiling: MaPrimeRénov’, the CEE bonus and other public grants together cannot exceed ${h.pct(1 - E.bleu, 0)} of the eligible expense for a blue household, ${h.pct(1 - E.jaune, 0)} for yellow and ${h.pct(1 - E.violet, 0)} for purple. The eligible expense is the quote including VAT, up to the item’s expense ceiling: ${h.eur(h.P.maprimerenov.forfaits.air_eau.plafond_depense)} for an air-to-water heat pump, ${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)} for ground-source. If the total exceeds it, MaPrimeRénov’ is reduced, never the CEE bonus. With the Coup de pouce, which multiplies the CEE bonus by five, the cap hits almost every case, all the more as the quote is low: a purple household fitting an air-to-water heat pump for ${h.eur(9000)} can lose much of its flat rate. The site’s calculator applies this rule and shows the amount cut.`;
    },
    faqs: (h) => [
      { q: 'When is the cap applied?', a: 'When MaPrimeRénov’ is paid, on the actual invoice and the grants declared. Anah asks for the CEE bonus and other grants when the application is filed, then recalculates on the invoice. If your final invoice is lower than the quote, the cut can grow: the grant paid may be lower than the one announced at approval.' },
      { q: 'Can I avoid the cap by giving up the CEE bonus?', a: 'You can, but it rarely pays: the cap reduces MaPrimeRénov’ by exactly the amount above the ceiling, so total grants stay the same. Giving up the CEE bonus loses its amount for no gain. It is only worth discussing if the CEE bonus on offer is very low.' },
      { q: 'Are pink households affected by the cap?', a: `The pink flat rate is zero for a heat pump in 2026, so there is nothing to cut. The ${h.pct(1 - h.P.ecretement.reste_a_charge_min.rose, 0)} ceiling exists for other items and whole-home renovation. The CEE bonus itself is never reduced by the MaPrimeRénov’ cap, whatever the household’s colour.` },
    ],
    body: (h) => `<h2>The rule in one formula</h2>
<p>MaPrimeRénov’ paid = the smaller of two amounts: your colour’s flat rate, or (maximum share × eligible expense) − CEE bonus − other grants. The maximum share is ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)}, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.jaune, 0)}, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} or ${h.pct(1 - h.P.ecretement.reste_a_charge_min.rose, 0)} depending on colour. The eligible expense is the quote including VAT, capped. The rule comes from article 3 of ${h.src('decret2020', 'decree no. 2020-26')}.</p>
<h2>Five worked cases</h2>
${exemples(h)}
<p>In all five cases, MaPrimeRénov’ is reduced. The blue household has the highest grant ceiling, but also the largest CEE bonus, bought at the “fuel poverty” price: on its own it covers more than half the expense. The purple household with a low quote loses almost all its flat rate, because the CEE bonus with Coup de pouce already fills almost all its ceiling. With a higher quote, the ceiling rises and the cut shrinks. The Coup de pouce therefore makes the cap routine: it is the rule, not the exception.</p>
<!--mini:mpr-->
<h2>The grant ceiling, quote by quote</h2>
${plafondsAides(h)}
<p>Above the expense ceiling, the grant ceiling stops rising: a dearer quote brings no extra grant. Compare this amount with the CEE bonus shown on the quote to see what will be left of MaPrimeRénov’. For a pink household the ceiling still applies, although it receives no MaPrimeRénov’ for a heat pump: it limits the CEE bonus and any local grant instead. The cap is checked by Anah when it pays the grant, on the final invoice: if the invoice is lower than the quote, the ceiling falls with it and the grant can shrink after the work.</p>
<h2>What it means for your choice</h2>
<p>A cheaper quote stays cheaper: the cap reduces grants, but never so far that a low quote costs more than a high one. It does, however, make adverts promising “up to X of MaPrimeRénov’ plus Y of bonus” wrong. Look at the out-of-pocket cost, worked out by the calculator, rather than the sum of grants.</p>
<h2>Other grants count too</h2>
<p>Grants from local authorities (region, département, town) count towards the ceiling. If you receive one, add it to your sums: it can reduce MaPrimeRénov’ by the same amount. The zero-rate eco-loan, being a loan and not a grant, does not count.</p>
<h2>And in 2027?</h2>
<p>The ${h.src('plf2027', '2027 draft budget')}, not voted as of ${h.date(h.today)}, provides that heat pumps be “funded solely by energy saving certificates”. If adopted as it stands, the question of capping per-item heat pump grants would vanish along with MaPrimeRénov’ itself. This is still to come: nothing is decided.</p>`,
  },
});
