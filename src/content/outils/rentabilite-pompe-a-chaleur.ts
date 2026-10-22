import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Temps de retour selon l'énergie remplacée et le climat, ménage violet, PAC air/eau au prix médian (moteur du site). */
const retours = (h: Helpers, rfr: number) => {
  const fr = h.lang === 'fr';
  const E: Array<['fioul' | 'gaz' | 'elec', string, string]> = [['fioul', 'Fioul', 'Oil'], ['gaz', 'Gaz', 'Gas'], ['elec', 'Électricité directe', 'Direct electric']];
  const D = ['13', '69', '67'];
  const rows = E.map(([e, f, en]) => [fr ? f : en, ...D.map((c) => {
    const r = h.M.simuler({ ...h.M.DEFAUT, dep: c, energie: e, rfr });
    return r.retourAns === null ? (fr ? 'jamais' : 'never') : `${h.num(r.retourAns, 1)} ${fr ? 'ans' : 'yrs'} (${h.eur(r.economie)}/${fr ? 'an' : 'yr'})`;
  })]);
  return h.table([fr ? 'Énergie remplacée' : 'Energy replaced', ...D.map((c) => h.dep(c).nom)], rows,
    fr ? `Temps de retour (et économie annuelle) : PAC air/eau à ${h.eur(h.P.prix_installation.air_eau.median_ttc)}, maison de 100 m² à isolation moyenne, foyer de 3 personnes avec ${h.eur(rfr)} de revenu fiscal, aides déduites ; prix de l’énergie d’octobre 2026 supposés constants`
       : `Payback (and yearly saving): air-to-water heat pump at ${h.eur(h.P.prix_installation.air_eau.median_ttc)}, averagely insulated 100 m² house, 3-person household with ${h.eur(rfr)} tax income, grants deducted; October 2026 energy prices held constant`, ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'rentabilite-pompe-a-chaleur',
  group: 'usage',
  order: 2,
  tool: 'simulateur',
  focus: 'retour',
  related: ['consommation-pompe-a-chaleur', 'pompe-a-chaleur-ou-chaudiere-gaz', 'remplacer-chaudiere-fioul', 'eco-ptz-pompe-a-chaleur', 'prix-pompe-a-chaleur'],
  sources: ['observatoire', 'ademe', 'cre', 'eurostatGaz', 'wob', 'meteo'],
  fr: {
    slug: 'rentabilite-pompe-a-chaleur',
    nav: 'Rentabilité d’une PAC',
    card: 'Temps de retour selon l’énergie remplacée, le climat et vos aides.',
    title: 'Rentabilité pompe à chaleur : le temps de retour réel',
    description: 'Rentabilité d’une pompe à chaleur : temps de retour selon l’énergie remplacée (fioul, gaz, électricité), le climat du département, aides 2026 et votre devis.',
    h1: 'Rentabilité d’une pompe à chaleur : en combien d’années ?',
    intro: 'Le temps de retour, c’est le reste à charge divisé par l’économie annuelle. Les deux dépendent de vous : le simulateur part de votre département.',
    resume: (h) => {
      const f = h.M.simuler({ ...h.M.DEFAUT, energie: 'fioul', rfr: 50000 }), g = h.M.simuler({ ...h.M.DEFAUT, rfr: 50000 });
      return `Une pompe à chaleur est rentable quand l’argent qu’elle fait économiser sur la facture de chauffage rembourse ce qu’elle a coûté, aides déduites, avant la fin de sa vie. Le calcul est simple : reste à charge divisé par l’économie annuelle. Ce qui le rend difficile, c’est que chaque terme varie beaucoup. L’économie dépend de l’énergie remplacée : le fioul et l’électricité directe coûtent cher au kWh de chaleur, le gaz beaucoup moins. Elle dépend aussi du climat : plus il fait froid, plus on chauffe, plus on économise. Le reste à charge dépend du devis et des aides, donc de vos revenus. Pour une maison moyenne de 100 m² dans le Rhône, un ménage violet qui remplace une chaudière au fioul récupère sa mise en ${h.num(f.retourAns ?? 0, 1)} ans environ ; s’il remplace une chaudière au gaz, il lui faut ${h.num(g.retourAns ?? 0, 1)} ans. La durée de vie conventionnelle retenue pour une PAC air/eau par la fiche CEE est de ${h.num(h.P.cee.bar_th_171.duree_vie_ans)} ans. Ce sont des estimations à prix de l’énergie constants.`;
    },
    faqs: (h) => [
      { q: 'Une PAC est-elle rentable en remplacement d’une chaudière gaz ?', a: `C’est le cas le plus serré. Le kWh de gaz coûte ${h.num(h.P.energie.gaz.kwh_ttc, 4)} € contre ${h.num(h.P.energie.electricite.kwh_ttc, 4)} € pour l’électricité : avec un rendement de ${h.num(h.P.rendements.scop.air_eau, 1)}, la PAC économise environ ${h.pct(1 - (h.P.energie.electricite.kwh_ttc / h.P.rendements.scop.air_eau) / (h.P.energie.gaz.kwh_ttc / h.P.rendements.chaudiere_defaut), 0)} de la facture, sur des montants plus faibles qu’avec le fioul. Dans un département froid, avec de fortes aides, le retour reste raisonnable ; dans le Midi, il peut dépasser la durée de vie de l’appareil.` },
      { q: 'Faut-il compter l’entretien dans la rentabilité ?', a: 'Oui pour être complet. Une PAC de plus de 4 kW doit être entretenue tous les deux ans par un professionnel, et une chaudière au gaz ou au fioul doit l’être chaque année. Les deux coûts se compensent en partie. Le simulateur ne les compte pas : ajoutez la différence à l’économie si vous la connaissez.' },
      { q: 'Et si le prix de l’électricité augmente ?', a: 'Le calcul suppose des prix constants. Si l’électricité monte plus vite que le gaz ou le fioul, le temps de retour s’allonge, et l’inverse s’il monte moins vite. Dans le simulateur, vous pouvez changer les prix du kWh dans « Affiner » pour tester un scénario, par exemple un gaz plus cher avec la hausse de la fiscalité carbone.' },
    ],
    body: (h) => `<h2>Le temps de retour selon l’énergie et le climat</h2>
${retours(h, 50000)}
<p>Trois départements, du plus doux au plus froid : les Bouches-du-Rhône, le Rhône et le Bas-Rhin. Le fioul et l’électricité directe donnent les retours les plus courts ; le gaz, les plus longs. Le ménage du tableau est violet ; un ménage bleu ou jaune, avec plus d’aides, récupère sa mise plus vite.</p>
<!--mini:retour-->
<h2>Ce que le calcul ne dit pas</h2>
<p>Le confort d’été, si la PAC est réversible ; la valeur du logement, qui peut gagner une ou deux classes de DPE ; la fin du fioul, dont les chaudières neuves sont interdites depuis 2022. Il ne dit pas non plus le risque d’une installation mal faite : l’étude de l’ADEME a mesuré des rendements de ${h.num(h.P.rendements.scop.air_eau_min, 1)} à ${h.num(h.P.rendements.scop.air_eau_max, 1)}, et un rendement bas peut doubler le temps de retour.</p>`,
  },
  en: {
    slug: 'heat-pump-payback',
    nav: 'Heat pump payback',
    card: 'Payback time by energy replaced, climate and your grants.',
    title: 'Heat pump payback in France: years to pay off, by fuel type',
    description: 'Heat pump payback in France: years to recoup the cost by energy replaced (oil, gas, electricity), your département’s climate, 2026 grants and your quote.',
    h1: 'Heat pump payback: how many years?',
    intro: 'Payback is the out-of-pocket cost divided by the yearly saving. Both depend on you: the calculator starts from your département.',
    resume: (h) => {
      const f = h.M.simuler({ ...h.M.DEFAUT, energie: 'fioul', rfr: 50000 }), g = h.M.simuler({ ...h.M.DEFAUT, rfr: 50000 });
      return `A heat pump pays off when the money it saves on the heating bill repays what it cost, grants deducted, before the end of its life. The sum is simple: out-of-pocket cost divided by the yearly saving. What makes it hard is that each term varies a lot. The saving depends on the energy replaced: oil and direct electric heating are expensive per kWh of heat, gas much less so. It also depends on the climate: the colder it is, the more you heat and the more you save. The out-of-pocket cost depends on the quote and grants, so on your income. For an average 100 m² house in the Rhône, a purple household replacing an oil boiler gets its money back in about ${h.num(f.retourAns ?? 0, 1)} years; replacing a gas boiler, it takes ${h.num(g.retourAns ?? 0, 1)} years. The conventional lifetime used for an air-to-water heat pump by the CEE sheet is ${h.num(h.P.cee.bar_th_171.duree_vie_ans)} years. These are estimates at constant energy prices.`;
    },
    faqs: (h) => [
      { q: 'Does a heat pump pay off when replacing a gas boiler?', a: `It is the tightest case. Gas costs €${h.num(h.P.energie.gaz.kwh_ttc, 4)} per kWh against €${h.num(h.P.energie.electricite.kwh_ttc, 4)} for electricity: with an efficiency of ${h.num(h.P.rendements.scop.air_eau, 1)}, the heat pump saves about ${h.pct(1 - (h.P.energie.electricite.kwh_ttc / h.P.rendements.scop.air_eau) / (h.P.energie.gaz.kwh_ttc / h.P.rendements.chaudiere_defaut), 0)} of the bill, on smaller sums than with oil. In a cold département with generous grants, payback stays reasonable; in the south, it can exceed the unit’s lifetime.` },
      { q: 'Should servicing be counted?', a: 'Yes, to be thorough. A heat pump above 4 kW must be serviced every two years by a professional, and a gas or oil boiler every year. The two costs partly cancel out. The calculator does not count them: add the difference to the saving if you know it.' },
      { q: 'What if electricity prices rise?', a: 'The calculation assumes constant prices. If electricity rises faster than gas or oil, payback lengthens, and the reverse if it rises more slowly. In the calculator you can change the kWh prices under “Refine” to test a scenario, such as dearer gas as carbon taxation increases.' },
    ],
    body: (h) => `<h2>Payback by energy and climate</h2>
${retours(h, 50000)}
<p>Three départements, from mildest to coldest: Bouches-du-Rhône, Rhône and Bas-Rhin. Oil and direct electric heating give the shortest paybacks; gas the longest. The household in the table is purple; a blue or yellow household, with more grants, gets its money back faster.</p>
<!--mini:retour-->
<h2>What the calculation leaves out</h2>
<p>Summer comfort, if the heat pump is reversible; the home’s value, which may gain one or two energy-rating classes; the end of oil, as new oil boilers have been banned since 2022. Nor does it capture the risk of a poor installation: ADEME’s study measured efficiencies from ${h.num(h.P.rendements.scop.air_eau_min, 1)} to ${h.num(h.P.rendements.scop.air_eau_max, 1)}, and a low efficiency can double the payback time.</p>`,
  },
});
