import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Mensualités d'éco-PTZ pour les restes à charge calculés par le moteur, par couleur. */
const mensualites = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const cas: Array<[number, string, string]> = [[20000, 'Bleu', 'Blue'], [35000, 'Jaune', 'Yellow'], [50000, 'Violet', 'Purple'], [90000, 'Rose', 'Pink']];
  const rows = cas.map(([rfr, f, e]) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, rfr });
    const p10 = h.M.ecoPtz(r.resteACharge, 10, 1), p15 = h.M.ecoPtz(r.resteACharge, 15, 1);
    const eco = r.economie / 12;
    return [fr ? f : e, h.eur(r.resteACharge), h.eur(p10.mensualite), h.eur(p15.mensualite), h.eur(eco)];
  });
  return h.table(fr ? ['Couleur', 'Reste à charge', 'Mensualité sur 10 ans', 'Sur 15 ans', 'Économie de chauffage par mois'] : ['Colour', 'Out of pocket', 'Monthly over 10 years', 'Over 15 years', 'Heating saving per month'], rows,
    fr ? `Calcul du site : PAC air/eau au prix médian de ${h.eur(h.P.prix_installation.air_eau.median_ttc)}, maison de 100 m² dans le Rhône, chaudière gaz remplacée, foyer de 3 personnes ; économie estimée aux prix de l’énergie d’octobre 2026`
       : `Site calculation: air-to-water heat pump at the ${h.eur(h.P.prix_installation.air_eau.median_ttc)} median price, 100 m² house in the Rhône, gas boiler replaced, 3-person household; saving estimated at October 2026 energy prices`, ['l', 'r', 'r', 'r', 'r']);
};

/** Mensualité sans intérêts selon le montant et la durée (moteur du site). */
const durees = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = [5000, 10000, 15000].map((m) => [h.eur(m), ...[5, 10, 15].map((a) => h.eur(h.M.ecoPtz(m, a, 1).mensualite))]);
  return h.table(fr ? ['Montant emprunté', 'Sur 5 ans', 'Sur 10 ans', 'Sur 15 ans'] : ['Amount borrowed', 'Over 5 years', 'Over 10 years', 'Over 15 years'], rows,
    fr ? 'Mensualité hors assurance et frais de dossier ; éco-PTZ d’une seule action' : 'Monthly payment excluding insurance and arrangement fees; single-item eco-PTZ', ['r', 'r', 'r', 'r']);
};
/** L'économie mensuelle (gaz) couvre-t-elle la mensualité sur 15 ans pour toutes les couleurs ? */
const couvre = (h: Helpers) => [20000, 35000, 50000, 90000].every((rfr) => { const r = h.M.simuler({ ...h.M.DEFAUT, rfr }); return r.economie / 12 >= h.M.ecoPtz(r.resteACharge, 15, 1).mensualite; });
/** Ménage jaune chauffé au fioul : mensualité sur 15 ans face à l'économie mensuelle. */
const fioulJaune = (h: Helpers) => {
  const r = h.M.simuler({ ...h.M.DEFAUT, rfr: 35000, energie: 'fioul' });
  const m = h.M.ecoPtz(r.resteACharge, 15, 1).mensualite, e = r.economie / 12;
  return { reste: r.resteACharge, m, e, part: e / m };
};

export default defineGuide({
  id: 'eco-ptz-pompe-a-chaleur',
  group: 'aides',
  order: 10,
  mini: 'ecoptz',
  related: ['maprimerenov-rose', 'rentabilite-pompe-a-chaleur', 'maprimerenov-pompe-a-chaleur', 'renovation-ampleur', 'prix-pompe-a-chaleur'],
  sources: ['ecoPtz', 'spMpr'],
  fr: {
    slug: 'eco-ptz-pompe-a-chaleur',
    nav: 'Éco-PTZ pompe à chaleur',
    card: 'Prêt sans intérêts jusqu’à 15 000 € pour une PAC, sans condition de revenus.',
    title: 'Éco-PTZ pompe à chaleur 2026 : montant, durée et mensualité',
    description: 'Éco-prêt à taux zéro pour une pompe à chaleur en 2026 : jusqu’à 15 000 € pour une action seule, sur 15 ans au plus, cumul avec MaPrimeRénov’ et mensualité.',
    h1: 'Éco-prêt à taux zéro pour une pompe à chaleur',
    intro: 'Les aides couvrent une partie du prix ; l’éco-PTZ finance le reste sans intérêts. Calculez la mensualité et comparez-la à l’économie de chauffage.',
    resume: (h) => {
      const E = h.P.eco_ptz;
      return `L’éco-prêt à taux zéro (éco-PTZ) est un prêt bancaire sans intérêts, dont l’État prend les intérêts à sa charge. Il finance des travaux de rénovation énergétique dans une résidence principale achevée depuis plus de deux ans, réalisés par une entreprise RGE. Il n’a aucune condition de revenus. Pour une seule action, comme l’installation d’une pompe à chaleur, il peut atteindre ${h.eur(E.une_action)} ; ${h.eur(E.deux_actions)} pour deux actions et ${h.eur(E.trois_actions)} pour trois ou plus. Le remboursement s’étale sur ${h.num(E.duree_max_ans)} ans au plus. L’éco-PTZ se cumule avec MaPrimeRénov’ et la prime CEE ; comme c’est un prêt, il n’entre pas dans le plafond d’écrêtement des aides. L’intérêt est simple : une mensualité sans intérêts qui, pour une PAC qui remplace du fioul ou de l’électricité, peut être couverte en grande partie par l’économie de chauffage. La banque reste libre d’accepter ou non le dossier, selon votre capacité de remboursement.`;
    },
    faqs: (h) => [
      { q: 'Toutes les banques proposent-elles l’éco-PTZ ?', a: 'Seules les banques qui ont signé une convention avec l’État le distribuent, ce qui est le cas des principaux réseaux. Chacune étudie votre capacité de remboursement comme pour un crédit ordinaire et peut refuser. Comparez au moins deux banques, et demandez les frais de dossier et d’assurance, qui ne sont pas couverts par le taux zéro.' },
      { q: 'Peut-on demander l’éco-PTZ après les travaux ?', a: 'Non, il se demande avant, sur la base des devis, avec un formulaire « devis » rempli par l’entreprise. Les travaux doivent ensuite être achevés dans les trois ans qui suivent l’attribution du prêt (prolongation possible dans quelques cas, comme la force majeure), et justifiés par les factures et le formulaire « factures ». Préparez le dossier en même temps que la demande de MaPrimeRénov’.' },
      { q: 'Un propriétaire bailleur peut-il obtenir l’éco-PTZ ?', a: `Oui, s’il loue ou s’engage à louer le logement comme résidence principale. Le prêt reste plafonné à ${h.eur(h.P.eco_ptz.une_action)} pour une seule action. Le logement doit alors être loué dans les six mois qui suivent la fin des travaux.` },
    ],
    body: (h) => `<h2>Ce que coûte la mensualité, couleur par couleur</h2>
${mensualites(h)}
<p>Pour la maison type du tableau, chauffée au gaz, l’économie mensuelle ${couvre(h) ? 'dépasse la mensualité sur quinze ans, quelle que soit la couleur' : 'ne couvre qu’une partie de la mensualité'}. Avec une chaudière au fioul ou des radiateurs électriques, l’économie est plus forte : changez l’énergie dans le simulateur pour le voir. Ces chiffres sont des estimations : votre consommation réelle et vos devis les remplacent.</p>
<!--mini:ecoptz-->
<h2>Les montants et la durée</h2>
<p>Le plafond dépend du nombre d’« actions » de travaux financées : une action (par exemple la PAC seule) ${h.eur(h.P.eco_ptz.une_action)} ; deux actions ${h.eur(h.P.eco_ptz.deux_actions)} ; trois actions ou plus ${h.eur(h.P.eco_ptz.trois_actions)}. Un éco-PTZ « performance énergétique globale » peut aller jusqu’à ${h.eur(h.P.eco_ptz.complementaire)} sur 20 ans, si un audit énergétique montre un gain d’au moins deux classes de DPE. Un éco-PTZ complémentaire peut aussi être demandé dans les cinq ans qui suivent l’offre du premier, jusqu’au ${h.date(h.P.eco_ptz.jusqu_au)}, dans la limite de ${h.eur(h.P.eco_ptz.complementaire)} au total. Les conditions détaillées sont sur ${h.src('ecoPtz', 'Service-Public.fr')}.</p>
<h2>Éco-PTZ ou avance de MaPrimeRénov’ ?</h2>
<p>Pour un ménage bleu, l’Anah peut verser une avance sur MaPrimeRénov’. L’éco-PTZ vient en plus, pour la part non couverte par les aides. Pour un ménage violet ou rose, l’éco-PTZ est souvent le seul moyen d’étaler le coût sans intérêts. Un prêt avance mutation (prêt hypothécaire remboursé à la vente du bien) existe aussi pour les ménages modestes, mais ses intérêts ne sont pas nuls.</p>
<h2>Sur combien d’années emprunter ?</h2>
${durees(h)}
<p>Sans intérêts, la durée ne change pas la somme remboursée : ${h.eur(10000)} empruntés coûtent ${h.eur(10000)}, sur cinq ans comme sur quinze. Allonger la durée baisse la mensualité et la rapproche de l’économie de chauffage, ce qui ménage le budget des premières années. Deux coûts suivent pourtant la durée : l’assurance emprunteur, si la banque l’exige, et d’éventuels frais de dossier. Demandez leur montant total avant de choisir.</p>
<p>Exemple pour une maison chauffée au fioul et un ménage jaune : reste à charge de ${h.eur(fioulJaune(h).reste)} après les aides, mensualité de ${h.eur(fioulJaune(h).m)} sur quinze ans, économie de chauffage d’environ ${h.eur(fioulJaune(h).e)} par mois. ${fioulJaune(h).part >= 1 ? `L’économie dépasse la mensualité de ${h.eur(fioulJaune(h).e - fioulJaune(h).m)} par mois : le changement de chauffage se finance seul.` : `L’économie couvre ${h.pct(fioulJaune(h).part, 0)} de la mensualité.`}</p>
<h2>Le dossier, étape par étape</h2>
<p>1. Faites établir le devis par une entreprise RGE, avec le formulaire « devis » de l’éco-PTZ qu’elle remplit et signe. 2. Déposez la demande dans une banque qui distribue le prêt, avant le début des travaux. 3. Une fois le prêt accordé, faites réaliser les travaux. 4. Remettez à la banque les factures et le formulaire « factures » dans les trois ans. Le formulaire « devis » et le formulaire « factures » sont les mêmes pour toutes les banques.</p>
<h2>Les pièges</h2>
<p>Certaines entreprises proposent un crédit à la consommation en même temps que le devis, parfois présenté comme « financement à taux zéro » alors que des frais ou une assurance s’y ajoutent. L’éco-PTZ se demande dans une banque, pas chez l’installateur. Lisez le taux annuel effectif global (TAEG) : celui d’un éco-PTZ est nul hors assurance.</p>`,
  },
  en: {
    slug: 'eco-loan-heat-pump',
    nav: 'Eco-loan for a heat pump',
    card: 'Interest-free loan up to €15,000 for a heat pump, no income condition.',
    title: 'Eco-PTZ heat pump loan 2026: amount, term, monthly payment',
    description: 'Eco-PTZ heat pump loan in France in 2026: up to €15,000 interest-free for a single item, repaid over 15 years at most, with MaPrimeRénov’ grants on top.',
    h1: 'The zero-rate eco-loan for a heat pump',
    intro: 'Grants cover part of the price; the eco-PTZ funds the rest without interest. Work out the monthly payment and compare it with the heating saving.',
    resume: (h) => {
      const E = h.P.eco_ptz;
      return `The zero-rate eco-loan (éco-PTZ) is an interest-free bank loan whose interest is paid by the State. It funds energy renovation work in a main residence completed more than two years ago, carried out by an RGE-certified firm. It has no income condition. For a single item, such as fitting a heat pump, it can reach ${h.eur(E.une_action)}; ${h.eur(E.deux_actions)} for two items and ${h.eur(E.trois_actions)} for three or more. Repayment is spread over ${h.num(E.duree_max_ans)} years at most. The eco-PTZ combines with MaPrimeRénov’ and the CEE bonus; being a loan, it does not count towards the grant cap. The appeal is simple: an interest-free monthly payment that, for a heat pump replacing oil or electric heating, can be largely covered by the heating saving. The bank remains free to accept or refuse the application, depending on your ability to repay.`;
    },
    faqs: (h) => [
      { q: 'Do all banks offer the eco-PTZ?', a: 'Only banks that have signed an agreement with the State offer it, which includes the main networks. Each assesses your ability to repay as for an ordinary loan and may refuse. Compare at least two banks, and ask about arrangement and insurance fees, which the zero rate does not cover.' },
      { q: 'Can I apply for the eco-PTZ after the work?', a: 'No, you apply beforehand, on the basis of quotes, with a “quotes” form completed by the firm. The work must then be finished within three years of the loan being granted (extendable in a few cases, such as force majeure), and proven with the invoices and the “invoices” form. Prepare the file at the same time as the MaPrimeRénov’ application.' },
      { q: 'Can a landlord get the eco-PTZ?', a: `Yes, if the home is let, or will be let, as a main residence. The loan is still capped at ${h.eur(h.P.eco_ptz.une_action)} for a single item. The home must then be let within six months of the end of the work.` },
    ],
    body: (h) => `<h2>The monthly payment, colour by colour</h2>
${mensualites(h)}
<p>For the gas-heated house in the table, the monthly saving ${couvre(h) ? 'exceeds the fifteen-year payment, whatever the colour' : 'covers only part of the payment'}. With an oil boiler or electric heaters the saving is larger: change the energy in the calculator to see it. These figures are estimates: your real consumption and quotes replace them.</p>
<!--mini:ecoptz-->
<h2>Amounts and term</h2>
<p>The ceiling depends on the number of work “items” funded: one item (for example the heat pump alone) ${h.eur(h.P.eco_ptz.une_action)}; two items ${h.eur(h.P.eco_ptz.deux_actions)}; three or more ${h.eur(h.P.eco_ptz.trois_actions)}. An “overall energy performance” eco-PTZ can reach ${h.eur(h.P.eco_ptz.complementaire)} over 20 years, if an energy audit shows a gain of at least two energy-rating classes. A supplementary eco-PTZ can also be requested within five years of the first offer, until ${h.date(h.P.eco_ptz.jusqu_au)}, within ${h.eur(h.P.eco_ptz.complementaire)} in total. Detailed conditions are on ${h.src('ecoPtz', 'Service-Public.fr')}.</p>
<h2>Eco-PTZ or MaPrimeRénov’ advance?</h2>
<p>For a blue household, Anah can pay an advance on MaPrimeRénov’. The eco-PTZ comes on top, for the part grants do not cover. For a purple or pink household, the eco-PTZ is often the only way to spread the cost without interest. A “prêt avance mutation” (a mortgage-backed loan repaid when the home is sold) also exists for low-income households, but its interest is not zero.</p>
<h2>Over how many years should you borrow?</h2>
${durees(h)}
<p>With no interest, the term does not change the sum repaid: ${h.eur(10000)} borrowed costs ${h.eur(10000)}, over five years or fifteen. A longer term lowers the monthly payment and brings it closer to the heating saving, which eases the budget in the first years. Two costs do follow the term, though: borrower insurance, if the bank requires it, and any arrangement fees. Ask for their total before choosing.</p>
<p>Example for an oil-heated house and a yellow household: ${h.eur(fioulJaune(h).reste)} left to pay after grants, a monthly payment of ${h.eur(fioulJaune(h).m)} over fifteen years, and a heating saving of about ${h.eur(fioulJaune(h).e)} a month. ${fioulJaune(h).part >= 1 ? `The saving exceeds the payment by ${h.eur(fioulJaune(h).e - fioulJaune(h).m)} a month: the change of heating pays for itself.` : `The saving covers ${h.pct(fioulJaune(h).part, 0)} of the payment.`}</p>
<h2>The application, step by step</h2>
<p>1. Have the quote drawn up by an RGE-certified firm, with the eco-PTZ “quotes” form, which the firm completes and signs. 2. Apply at a bank that offers the loan, before the work starts. 3. Once the loan is granted, have the work done. 4. Hand the bank the invoices and the “invoices” form within three years. The “quotes” and “invoices” forms are the same at every bank, so you can take them from one bank to another.</p>
<p>If your own bank refuses or does not offer the loan, another one can: the eco-PTZ is not tied to the bank that holds your current account. Some banks ask you to move your salary or take out their insurance in exchange; that is a commercial condition, not a rule of the loan, and you can compare offers on that point too.</p>
<h2>Pitfalls</h2>
<p>Some firms offer consumer credit along with the quote, sometimes sold as “zero-rate financing” although fees or insurance are added. The eco-PTZ is applied for at a bank, not through the installer. Read the annual percentage rate (TAEG): an eco-PTZ’s is zero, insurance aside.</p>`,
  },
});
