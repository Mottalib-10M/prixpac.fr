import { defineGuide } from '../../lib/guide-types';
import { tableCouleur } from '../../lib/couleur-pages';

const RFR = 50000;

export default defineGuide({
  id: 'maprimerenov-violet',
  group: 'aides',
  order: 8,
  tool: 'simulateur',
  preset: { rfr: RFR, personnes: 3 },
  focus: 'mpr',
  related: ['ecretement-maprimerenov', 'plafonds-revenus-maprimerenov', 'maprimerenov-jaune', 'maprimerenov-rose', 'pompe-a-chaleur-geothermique'],
  sources: ['spMpr', 'decret2020', 'emmy', 'bar171'],
  fr: {
    slug: 'maprimerenov-violet',
    nav: 'MaPrimeRénov’ violet',
    card: 'Revenus intermédiaires : forfait de 3 000 € en air/eau, souvent écrêté.',
    title: 'MaPrimeRénov’ violet 2026 : pompe à chaleur et écrêtement',
    description: 'MaPrimeRénov’ violet 2026 pour une pompe à chaleur : forfait des revenus moyens, aides plafonnées à 60 % de la dépense, prime CEE classique, montant réel.',
    h1: 'MaPrimeRénov’ violet : le forfait que l’écrêtement grignote',
    intro: 'Le simulateur est réglé sur 3 personnes et 50 000 € de revenu fiscal hors Île-de-France : catégorie violette. Regardez la ligne « écrêtement ».',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits, p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      const r = h.M.simuler({ ...h.M.DEFAUT, rfr: RFR, prixTtc: 9000 });
      return `Les ménages violets ont des revenus « intermédiaires » : pour trois personnes, de ${h.eur(h.M.plafondsRfr(3, false).jaune + 1)} à ${h.eur(p.violet)} de revenu fiscal de référence hors Île-de-France, jusqu’à ${h.eur(q.violet)} en Île-de-France. MaPrimeRénov’ leur accorde en 2026 un forfait de ${h.eur(F.air_eau.violet)} pour une PAC air/eau et ${h.eur(F.geo.violet)} pour une PAC géothermique. C’est la catégorie la plus touchée par l’écrêtement : les aides réunies ne peuvent pas dépasser ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} de la dépense éligible, et la prime CEE avec Coup de pouce, même au prix classique, en occupe déjà une grande part. Sur un devis d’air/eau de ${h.eur(9000)} dans le Rhône, le forfait de ${h.eur(r.forfait)} tombe à ${h.eur(r.mpr)}. Plus le devis est élevé, plus le plafond monte et moins MaPrimeRénov’ est réduite ; mais le reste à charge, lui, monte aussi. Ce qui compte, c’est le reste à charge, pas la somme annoncée des aides.`;
    },
    faqs: (h) => [
      { q: 'Faut-il renoncer à MaPrimeRénov’ quand elle est presque entièrement écrêtée ?', a: 'Le dossier MaPrimeRénov’ demande du temps : création du compte, devis, accord avant travaux, facture. Si le simulateur montre qu’il reste quelques centaines d’euros après écrêtement, à vous de juger si cela vaut la démarche. La prime CEE, elle, reste due dans tous les cas et doit être acceptée avant la signature du devis.' },
      { q: 'Pourquoi ma prime CEE est-elle plus basse que celle d’un ménage jaune ?', a: `Les travaux des ménages violets produisent des certificats classiques, revendus en moyenne ${h.num(h.P.cee.prix_mwh.classique, 2)} € le MWh cumac en ${h.moisCee} au registre Emmy, contre ${h.num(h.P.cee.prix_mwh.precarite, 2)} € pour les certificats précarité des ménages bleus et jaunes. Le volume de kWh cumac, lui, est identique pour tous.` },
      { q: 'La géothermie est-elle plus intéressante pour un ménage violet ?', a: `Son forfait est le double (${h.eur(h.P.maprimerenov.forfaits.geo.violet)}) et son plafond de dépense plus élevé (${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)}), donc l’écrêtement mord moins en proportion. Mais l’installation coûte nettement plus cher. Comparez le reste à charge et l’économie annuelle des deux solutions dans le simulateur, avec vos devis.` },
    ],
    body: (h) => `<h2>Aides et reste à charge d’un ménage violet</h2>
${tableCouleur(h, RFR)}
<p>Le tableau montre l’effet du plafond de ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} : quel que soit le devis, le ménage paie au moins ${h.pct(h.P.ecretement.reste_a_charge_min.violet, 0)} de la dépense éligible, plus tout ce qui dépasse le plafond de dépense. La formule complète est sur la page ${h.a('ecretement-maprimerenov', 'écrêtement')}.</p>
<h2>Le projet 2027</h2>
<p>Le projet de loi de finances pour 2027, non voté, prévoit que les pompes à chaleur soient financées uniquement par les CEE. Pour un ménage violet dont MaPrimeRénov’ est déjà largement écrêtée, l’écart serait faible ; pour un ménage bleu, il serait plus net. C’est à venir et peut changer pendant le débat parlementaire.</p>
<h2>Les autres leviers</h2>
<p>La TVA à ${h.pct(h.P.tva.pac, 1)} sur la PAC et sa pose dans un logement de plus de deux ans, et l’${h.a('eco-ptz-pompe-a-chaleur', 'éco-prêt à taux zéro')} pour étaler le reste à charge sans intérêts.</p>`,
  },
  en: {
    slug: 'maprimerenov-purple',
    nav: 'MaPrimeRénov’ purple',
    card: 'Middle incomes: €3,000 flat rate for air-to-water, often capped.',
    title: 'MaPrimeRénov’ purple 2026: heat pump grant and the grant cap',
    description: 'MaPrimeRénov’ purple in 2026 for a heat pump: the middle-income flat rate, total grants capped at 60% of the expense, the standard CEE bonus, amount paid.',
    h1: 'MaPrimeRénov’ purple: the flat rate the cap eats into',
    intro: 'The calculator is set to 3 people and €50,000 reference tax income outside Île-de-France: the purple band. Watch the “cut” line.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits, p = h.M.plafondsRfr(3, false), q = h.M.plafondsRfr(3, true);
      const r = h.M.simuler({ ...h.M.DEFAUT, rfr: RFR, prixTtc: 9000 });
      return `Purple households have “middle” incomes: for three people, from ${h.eur(h.M.plafondsRfr(3, false).jaune + 1)} to ${h.eur(p.violet)} of reference tax income outside Île-de-France, up to ${h.eur(q.violet)} in Île-de-France. In 2026 MaPrimeRénov’ grants them a flat rate of ${h.eur(F.air_eau.violet)} for an air-to-water heat pump and ${h.eur(F.geo.violet)} for ground-source. This band is the hardest hit by the cap: total grants cannot exceed ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} of the eligible expense, and the CEE bonus with Coup de pouce, even at the standard price, already takes a large share. On a ${h.eur(9000)} air-to-water quote in the Rhône, the ${h.eur(r.forfait)} flat rate falls to ${h.eur(r.mpr)}. The higher the quote, the higher the ceiling and the smaller the cut; but the out-of-pocket cost rises too. What matters is the out-of-pocket cost, not the advertised sum of grants.`;
    },
    faqs: (h) => [
      { q: 'Should I give up MaPrimeRénov’ when it is almost entirely cut?', a: 'A MaPrimeRénov’ application takes time: account creation, quotes, approval before work, invoice. If the calculator shows only a few hundred euros left after the cap, it is your call whether that is worth the effort. The CEE bonus is due in every case and must be accepted before signing the quote.' },
      { q: 'Why is my CEE bonus lower than a yellow household’s?', a: `Work by purple households generates standard certificates, sold at an average €${h.num(h.P.cee.prix_mwh.classique, 2)} per MWh cumac in ${h.moisCee} on the Emmy registry, against €${h.num(h.P.cee.prix_mwh.precarite, 2)} for the fuel-poverty certificates of blue and yellow households. The kWh cumac volume itself is the same for everyone.` },
      { q: 'Is ground-source a better deal for a purple household?', a: `Its flat rate is double (${h.eur(h.P.maprimerenov.forfaits.geo.violet)}) and its expense ceiling higher (${h.eur(h.P.maprimerenov.forfaits.geo.plafond_depense)}), so the cap bites less in proportion. But installation costs much more. Compare the out-of-pocket cost and yearly saving of both options in the calculator, with your quotes.` },
    ],
    body: (h) => `<h2>Grants and out-of-pocket cost for a purple household</h2>
${tableCouleur(h, RFR)}
<p>The table shows the effect of the ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} ceiling: whatever the quote, the household pays at least ${h.pct(h.P.ecretement.reste_a_charge_min.violet, 0)} of the eligible expense, plus everything above the expense ceiling. The full formula is on the ${h.a('ecretement-maprimerenov', 'grant cap')} page.</p>
<h2>The 2027 plan</h2>
<p>The 2027 draft budget, not yet voted, plans for heat pumps to be funded solely through CEE. For a purple household whose MaPrimeRénov’ is already largely cut, the difference would be small; for a blue household it would be sharper. This is still to come and may change during the parliamentary debate.</p>
<h2>Other levers</h2>
<p>${h.pct(h.P.tva.pac, 1)} VAT on the heat pump and its fitting in a home over two years old, and the ${h.a('eco-ptz-pompe-a-chaleur', 'zero-rate eco-loan')} to spread the out-of-pocket cost without interest.</p>`,
  },
});
