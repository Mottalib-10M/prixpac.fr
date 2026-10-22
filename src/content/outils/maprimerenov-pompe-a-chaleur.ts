import { defineGuide, type Helpers } from '../../lib/guide-types';

/** MaPrimeRénov' 2026 contre projet 2027 (CEE seules), pour la maison type, par couleur. */
const projet2027 = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rfr: Record<string, number> = { bleu: 20000, jaune: 35000, violet: 50000, rose: 90000 };
  const nom: Record<string, [string, string]> = { bleu: ['Bleu', 'Blue'], jaune: ['Jaune', 'Yellow'], violet: ['Violet', 'Purple'], rose: ['Rose', 'Pink'] };
  return h.table(fr ? ['Catégorie', 'MaPrimeRénov’ 2026', 'Prime CEE', 'Reste à charge 2026', 'Sans MaPrimeRénov’ (projet 2027)'] : ['Category', 'MaPrimeRénov’ 2026', 'CEE bonus', 'Out of pocket 2026', 'Without MaPrimeRénov’ (2027 plan)'],
    Object.keys(rfr).map((c) => { const r = h.M.simuler({ ...h.M.DEFAUT, rfr: rfr[c] }); return [nom[c][fr ? 0 : 1], h.eur(r.mpr), h.eur(r.cee.eur), h.eur(r.resteACharge), h.eur(r.prixTtc - r.cee.eur)]; }),
    fr ? `PAC air/eau à ${h.eur(h.P.prix_installation.air_eau.median_ttc)} TTC remplaçant une chaudière gaz, maison de 100 m² dans le Rhône, 3 personnes ; prix CEE Emmy de ${h.moisCee}` : `Air-to-water heat pump at ${h.eur(h.P.prix_installation.air_eau.median_ttc)} incl. VAT replacing a gas boiler, 100 m² house in the Rhône, 3 people; Emmy CEE price of ${h.moisCee}`, ['l', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'maprimerenov-pompe-a-chaleur',
  group: 'aides',
  order: 1,
  tool: 'simulateur',
  focus: 'mpr',
  mini: 'mpr',
  related: ['ecretement-maprimerenov', 'plafonds-revenus-maprimerenov', 'prime-cee-pompe-a-chaleur', 'coup-de-pouce-chauffage', 'maprimerenov-bleu', 'eco-ptz-pompe-a-chaleur'],
  sources: ['spMpr', 'decret2020', 'plf2027', 'bar171', 'emmy', 'franceRenov'],
  fr: {
    slug: 'maprimerenov-pompe-a-chaleur',
    nav: 'MaPrimeRénov’ PAC 2026',
    card: 'Forfait par couleur, écrêtement, conditions et projet 2027.',
    title: 'MaPrimeRénov’ pompe à chaleur 2026 : montant et conditions',
    description: 'MaPrimeRénov’ 2026 pour une pompe à chaleur air/eau ou géothermique : forfait par couleur, écrêtement par la prime CEE, conditions et projet de fin en 2027.',
    h1: 'MaPrimeRénov’ pour une pompe à chaleur en 2026',
    intro: 'Le forfait affiché par l’Anah n’est pas toujours celui que vous toucherez : la prime CEE peut le réduire. Le simulateur montre la prime réellement versée.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits;
      return `En 2026, MaPrimeRénov’ par geste verse un forfait pour l’installation d’une pompe à chaleur air/eau (${h.eur(F.air_eau.bleu)} pour un ménage bleu, ${h.eur(F.air_eau.jaune)} pour un jaune, ${h.eur(F.air_eau.violet)} pour un violet) ou géothermique (${h.eur(F.geo.bleu)}, ${h.eur(F.geo.jaune)}, ${h.eur(F.geo.violet)}). Les ménages roses n’ont rien, et la PAC air/air n’est plus financée. Le forfait est un maximum : MaPrimeRénov’, la prime CEE et les autres aides ne peuvent pas dépasser une part de la dépense fixée par décret, de 90 % pour un ménage bleu à 60 % pour un violet, dans la limite de ${h.eur(F.air_eau.plafond_depense)} de dépense pour une PAC air/eau. Avec un Coup de pouce, la prime CEE remplit souvent cette marge et MaPrimeRénov’ baisse d’autant. La demande se fait en ligne avant la signature du devis, avec une entreprise RGE, pour un logement de plus de deux ans occupé en résidence principale. Le projet de budget 2027 prévoit de retirer les PAC de MaPrimeRénov’ : ce n’est pas voté.`;
    },
    faqs: (h) => {
      const F = h.P.maprimerenov.forfaits;
      return [
        { q: 'Combien touche-t-on de MaPrimeRénov’ pour une PAC air/eau en 2026 ?', a: `Le forfait est de ${h.eur(F.air_eau.bleu)} pour un ménage bleu, ${h.eur(F.air_eau.jaune)} pour un jaune et ${h.eur(F.air_eau.violet)} pour un violet. Il peut être réduit par l’écrêtement : si la prime CEE et MaPrimeRénov’ ensemble dépassent la part maximale de la dépense (90 %, 75 % ou 60 % de ${h.eur(F.air_eau.plafond_depense)} au plus), c’est MaPrimeRénov’ qui baisse. Le simulateur ci-dessus fait ce calcul.` },
        { q: 'Faut-il attendre l’accord de l’Anah avant de signer le devis ?', a: 'Il faut au moins déposer la demande avant de commencer les travaux. Un devis peut être signé avant le dépôt, mais les travaux ne doivent pas démarrer avant. Après l’accord, vous avez deux ans pour les terminer et envoyer la facture. Les ménages bleus peuvent demander une avance, jusqu’à la moitié de la prime.' },
        { q: 'Un propriétaire bailleur peut-il toucher MaPrimeRénov’ pour une PAC ?', a: `Oui, s’il s’engage à louer le logement en résidence principale pendant au moins ${h.num(h.P.maprimerenov.location_annees)} ans. Sa catégorie de revenus est déterminée par son propre revenu fiscal de référence, pas par celui du locataire. Les résidences secondaires sont exclues, et elles le sont aussi du Coup de pouce CEE.` },
        { q: 'Que se passe-t-il si MaPrimeRénov’ PAC disparaît en 2027 ?', a: 'Rien pour un dossier déposé et accordé en 2026 : il reste soumis au barème de 2026. Si le projet de budget est voté tel quel, les dossiers de 2027 n’auraient plus que la prime CEE, éventuellement relevée par l’État. Le tableau de cette page chiffre ce que représenterait la perte pour chaque couleur.' },
      ];
    },
    body: (h) => {
      const P = h.P, E = P.ecretement.reste_a_charge_min;
      return `<h2>Ce que calcule le simulateur de cette page</h2>
<p>En tête du résultat, la MaPrimeRénov’ réellement versée, après écrêtement. Votre couleur vient du revenu fiscal de référence et du nombre de personnes, avec les plafonds d’Île-de-France si votre département en fait partie. Le forfait vient du barème 2026 de la fiche Service-Public, relue le ${h.date('2026-09-01')} par l’administration et le ${h.date(P.retrieved_at)} par nous. La prime CEE est estimée au prix moyen du registre Emmy ; si votre devis indique un autre montant, saisissez son prix dans « Affiner » et retenez le montant de la prime qui y figure.</p>
<h2>Le plafond qui réduit la prime</h2>
<p>Le décret n° 2020-26 fixe un reste à charge minimal : ${h.pct(E.bleu, 0)} de la dépense éligible pour un ménage bleu, ${h.pct(E.jaune, 0)} pour un jaune, ${h.pct(E.violet, 0)} pour un violet. Exemple : un ménage violet installe une PAC à ${h.eur(15000)}. La dépense retenue est plafonnée à ${h.eur(P.maprimerenov.forfaits.air_eau.plafond_depense)} ; les aides ne peuvent pas dépasser ${h.eur(P.maprimerenov.forfaits.air_eau.plafond_depense * (1 - E.violet))}. Si l’entreprise verse ${h.eur(4800)} de prime CEE, MaPrimeRénov’ ne peut plus être que de ${h.eur(P.maprimerenov.forfaits.air_eau.plafond_depense * (1 - E.violet) - 4800)}, au lieu du forfait de ${h.eur(P.maprimerenov.forfaits.air_eau.violet)}.</p>
<h2>Si le projet de budget 2027 est voté</h2>
<p>L’annexe du projet de loi de finances pour 2027 sur la rénovation énergétique prévoit que les pompes à chaleur soient « uniquement financées par les certificats d’économie d’énergie ». Le tableau compare, pour la même maison, le reste à charge de 2026 et celui qu’on aurait sans MaPrimeRénov’, à prime CEE inchangée :</p>
${projet2027(h)}
<p>Pour un ménage violet, l’écart est faible, parce que l’écrêtement réduit déjà beaucoup MaPrimeRénov’. Pour un ménage bleu ou jaune, il se compte en milliers d’euros. Si votre projet est prêt, déposer le dossier en 2026 protège le barème actuel. Le simulateur officiel et les conseillers ${h.src('franceRenov', 'France Rénov’')} confirment l’éligibilité.</p>`;
    },
  },
  en: {
    slug: 'maprimerenov-heat-pump',
    nav: 'MaPrimeRénov’ heat pump 2026',
    card: 'Flat rate by colour, the cap, conditions and the 2027 plan.',
    title: 'MaPrimeRénov’ heat pump grant 2026: amount and conditions',
    description: 'MaPrimeRénov’ 2026 for an air-to-water or ground-source heat pump in France: flat rate by colour, cap triggered by the CEE bonus, conditions and the 2027 plan.',
    h1: 'MaPrimeRénov’ for a heat pump in 2026',
    intro: 'The flat rate shown by the Anah is not always what you get: the CEE bonus can reduce it. The calculator shows the grant actually paid.',
    resume: (h) => {
      const F = h.P.maprimerenov.forfaits;
      return `In 2026 the per-item MaPrimeRénov’ pays a flat amount for installing an air-to-water heat pump (${h.eur(F.air_eau.bleu)} for a blue household, ${h.eur(F.air_eau.jaune)} for yellow, ${h.eur(F.air_eau.violet)} for purple) or a ground-source one (${h.eur(F.geo.bleu)}, ${h.eur(F.geo.jaune)}, ${h.eur(F.geo.violet)}). Pink households get nothing, and air-to-air units are no longer funded. The flat rate is a ceiling: MaPrimeRénov’, the CEE bonus and other grants may not exceed a share of the cost set by decree, from 90% for a blue household to 60% for purple, within an expense ceiling of ${h.eur(F.air_eau.plafond_depense)} for an air-to-water heat pump. With a Coup de pouce, the CEE bonus often fills that margin and MaPrimeRénov’ falls accordingly. You apply online before the work starts, with an RGE-certified firm, for a home over two years old used as a main residence. The 2027 draft budget plans to remove heat pumps from MaPrimeRénov’; it has not been voted.`;
    },
    faqs: (h) => {
      const F = h.P.maprimerenov.forfaits;
      return [
        { q: 'How much MaPrimeRénov’ is paid for an air-to-water heat pump in 2026?', a: `The flat rate is ${h.eur(F.air_eau.bleu)} for a blue household, ${h.eur(F.air_eau.jaune)} for yellow and ${h.eur(F.air_eau.violet)} for purple. It can be reduced by the cap: if the CEE bonus and MaPrimeRénov’ together exceed the maximum share of the cost (90%, 75% or 60% of at most ${h.eur(F.air_eau.plafond_depense)}), MaPrimeRénov’ is what goes down. The calculator above does this sum.` },
        { q: 'Must I wait for the Anah’s approval before signing the quote?', a: 'You must at least file the application before the work begins. A quote may be signed before filing, but the work must not start before. Once approved, you have two years to finish and send the invoice. Blue households can ask for an advance of up to half the grant.' },
        { q: 'Can a landlord get MaPrimeRénov’ for a heat pump?', a: `Yes, if the landlord undertakes to let the home as a main residence for at least ${h.num(h.P.maprimerenov.location_annees)} years. The income category depends on the landlord’s own reference tax income, not the tenant’s. Second homes are excluded, and they are also excluded from the CEE Coup de pouce.` },
        { q: 'What happens if the heat pump MaPrimeRénov’ ends in 2027?', a: 'Nothing for an application filed and approved in 2026: it stays under the 2026 scale. If the draft budget is passed as it stands, 2027 applications would only have the CEE bonus, possibly raised by the State. The table on this page shows what the loss would mean for each colour.' },
      ];
    },
    body: (h) => {
      const P = h.P, E = P.ecretement.reste_a_charge_min;
      return `<h2>What the calculator on this page works out</h2>
<p>The result opens with the MaPrimeRénov’ actually paid, after the cap. Your colour comes from your reference tax income and household size, with the Île-de-France ceilings if your département is in that region. The flat rate comes from the 2026 scale on the Service-Public page, checked on ${h.date('2026-09-01')} by the administration and on ${h.date(P.retrieved_at)} by us. The CEE bonus is estimated at the Emmy registry’s average price; if your quote shows another figure, enter its price under “Refine” and go by the bonus written on it.</p>
<h2>The ceiling that cuts the grant</h2>
<p>Decree 2020-26 sets a minimum out-of-pocket share: ${h.pct(E.bleu, 0)} of the eligible expense for a blue household, ${h.pct(E.jaune, 0)} for yellow, ${h.pct(E.violet, 0)} for purple. Example: a purple household installs a heat pump at ${h.eur(15000)}. The eligible expense is capped at ${h.eur(P.maprimerenov.forfaits.air_eau.plafond_depense)}; grants may not exceed ${h.eur(P.maprimerenov.forfaits.air_eau.plafond_depense * (1 - E.violet))}. If the firm pays a ${h.eur(4800)} CEE bonus, MaPrimeRénov’ can only be ${h.eur(P.maprimerenov.forfaits.air_eau.plafond_depense * (1 - E.violet) - 4800)}, instead of the ${h.eur(P.maprimerenov.forfaits.air_eau.violet)} flat rate.</p>
<h2>If the 2027 draft budget is passed</h2>
<p>The annex to the 2027 draft budget on energy renovation plans for heat pumps to be “funded solely by energy-savings certificates”. The table compares, for the same house, the 2026 out-of-pocket cost with what it would be without MaPrimeRénov’, the CEE bonus unchanged:</p>
${projet2027(h)}
<p>For a purple household the gap is small, because the cap already cuts MaPrimeRénov’ heavily. For a blue or yellow household it runs into thousands of euros. If your project is ready, filing in 2026 secures the current scale. The official simulator and the ${h.src('franceRenov', 'France Rénov’')} advisers confirm eligibility.</p>`;
    },
  },
});
