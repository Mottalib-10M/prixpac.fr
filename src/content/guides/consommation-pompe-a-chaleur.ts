import { defineGuide, type Helpers } from '../../lib/guide-types';

const DEPS = ['06', '13', '33', '69', '75', '59', '67', '25'];

/** Consommation électrique annuelle d'une PAC, 100 m² isolation moyenne, par département (moteur du site). */
const grille = (h: Helpers) => {
  const fr = h.lang === 'fr', pe = h.P.energie.electricite.kwh_ttc;
  const rows = DEPS.map((c) => {
    const d = h.dep(c), b = h.M.besoinChauffage(100, 'moyenne', d.dju);
    const ae = b / h.P.rendements.scop.air_eau, ge = b / h.P.rendements.scop.geo;
    return [`${d.nom} (${d.code})`, h.num(d.dju), `${h.num(b)} kWh`, `${h.num(ae)} kWh`, h.eur(ae * pe), h.eur(ge * pe)];
  });
  return h.table(fr ? ['Département', 'DJU', 'Chaleur nécessaire', 'Électricité air/eau', 'Coût air/eau', 'Coût géothermie'] : ['Département', 'HDD', 'Heat needed', 'Air-to-water electricity', 'Air-to-water cost', 'Ground-source cost'], rows,
    fr ? `Maison de 100 m² à isolation moyenne, chauffage seul ; DJU moyens 2015-2024 (Météo-France) ; rendements ADEME ; électricité à ${h.num(pe, 4)} € le kWh (tarif bleu Base, ${h.dateElec}), hors abonnement` : `100 m² averagely insulated house, space heating only; average HDD 2015-2024 (Météo-France); ADEME efficiencies; electricity at €${h.num(pe, 4)} per kWh (regulated Base tariff, ${h.dateElec}), standing charge excluded`, ['l', 'r', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'consommation-pompe-a-chaleur',
  group: 'usage',
  order: 1,
  mini: 'conso',
  related: ['rentabilite-pompe-a-chaleur', 'climat-degres-jours-departement', 'pompe-a-chaleur-ou-chaudiere-gaz', 'puissance-pompe-a-chaleur', 'remplacer-radiateurs-electriques'],
  sources: ['ademe', 'meteo', 'cre'],
  fr: {
    slug: 'consommation-pompe-a-chaleur',
    nav: 'Consommation d’une PAC',
    card: 'kWh d’électricité par an et coût selon le climat réel de votre département.',
    title: 'Consommation pompe à chaleur : kWh et coût par département',
    description: 'Consommation d’une pompe à chaleur : kWh d’électricité par an et coût selon les degrés-jours du département, le rendement mesuré par l’ADEME, tarif bleu 2026.',
    h1: 'Consommation d’une pompe à chaleur : le calcul selon votre climat',
    intro: 'Une PAC ne consomme pas la même chose à Nice et à Strasbourg. Le calcul part des degrés-jours mesurés par Météo-France dans votre département.',
    resume: (h) => {
      const d = h.dep('69'), b = h.M.besoinChauffage(100, 'moyenne', d.dju), k = b / h.P.rendements.scop.air_eau;
      return `La consommation d’une pompe à chaleur se calcule en deux temps. D’abord la chaleur dont la maison a besoin sur l’année, qui dépend de sa surface, de son isolation et du climat, mesuré en degrés-jours unifiés (DJU) : la somme, jour après jour, de l’écart entre 18 °C et la température extérieure moyenne. Ensuite le rendement annuel de la PAC, ou SCOP : le nombre de kWh de chaleur produits pour un kWh d’électricité consommé. L’ADEME a mesuré sur des installations réelles un rendement moyen de ${h.num(h.P.rendements.scop.air_eau, 1)} pour l’air/eau, avec des écarts de ${h.num(h.P.rendements.scop.air_eau_min, 1)} à ${h.num(h.P.rendements.scop.air_eau_max, 1)} selon la pose et le réglage, et de ${h.num(h.P.rendements.scop.geo, 1)} pour la géothermie. Pour une maison de 100 m² moyennement isolée dans le Rhône (${h.num(d.dju)} DJU), il faut environ ${h.num(b)} kWh de chaleur, soit ${h.num(k)} kWh d’électricité en air/eau : ${h.eur(k * h.P.energie.electricite.kwh_ttc)} par an au tarif bleu. Ce sont des estimations ; votre consommation actuelle, saisie dans le simulateur, les remplace.`;
    },
    faqs: (h) => [
      { q: 'Faut-il augmenter la puissance de son compteur avec une PAC ?', a: `Souvent non pour une PAC air/eau bien dimensionnée dans une maison déjà en 9 kVA, mais l’installateur doit le vérifier, surtout si la PAC a une résistance d’appoint. Un abonnement Base 9 kVA au tarif bleu coûte ${h.eur(h.P.energie.electricite.abonnement_9kva_ttc, 2)} par an depuis le ${h.dateElec} ; passer à une puissance supérieure augmente ce montant.` },
      { q: 'Pourquoi ma PAC consomme-t-elle plus que prévu ?', a: 'Les causes les plus fréquentes sont une température d’eau trop haute dans les radiateurs, une résistance d’appoint qui se déclenche trop tôt, un surdimensionnement qui fait tourner la PAC par cycles courts, ou un hiver plus froid que la moyenne. L’étude de l’ADEME a trouvé des rendements allant du simple au plus du double selon la qualité de pose et de réglage.' },
      { q: 'La consommation de la PAC inclut-elle l’eau chaude ?', a: 'Pas dans ce calcul : il porte sur le chauffage seul. Une PAC air/eau qui produit aussi l’eau chaude consomme davantage, de l’ordre de quelques centaines à un millier de kWh d’électricité par an selon le nombre de personnes et le rendement. Les DJU ne mesurent que le besoin de chauffage.' },
    ],
    body: (h) => `<h2>Consommation et coût, département par département</h2>
${grille(h)}
<p>Les 96 départements sont dans le tableau de la page ${h.a('pompe-a-chaleur-par-departement', 'pompe à chaleur par département')}. Les DJU de chaque département sont ceux de la station Météo-France la plus proche du chef-lieu ; dans le simulateur, vous pouvez choisir une autre station, en montagne par exemple.</p>
<!--mini:conso-->
<h2>Le rendement réel, pas celui de la fiche technique</h2>
<p>Les fabricants affichent un coefficient de performance (COP) mesuré en laboratoire, à une température extérieure de 7 °C, souvent supérieur à 4. Le rendement annuel réel est plus bas : il intègre les jours froids, le dégivrage, l’eau chaude des radiateurs et les arrêts. C’est pour cela que le site part des mesures de l’${h.src('ademe', 'ADEME')} sur des maisons habitées. Si votre installateur vous annonce un SCOP, vous pouvez le saisir dans « Affiner » ; le simulateur recalcule la consommation.</p>
<h2>Ce qui fait baisser la consommation</h2>
<p>Une température d’eau basse : plus l’eau des radiateurs est chaude, plus la PAC peine. Les planchers chauffants et les radiateurs surdimensionnés sont les meilleurs émetteurs. Une loi d’eau bien réglée, qui adapte la température de l’eau à la température extérieure. Un dimensionnement juste (voir ${h.a('puissance-pompe-a-chaleur', 'la puissance d’une PAC')}). Et, bien sûr, l’isolation : passer d’une maison moyenne à une maison bien isolée réduit le besoin de chauffage d’environ un tiers dans le calcul du site.</p>
<h2>Comparer avec votre facture actuelle</h2>
<p>La consommation seule ne dit pas si la PAC est intéressante : il faut la comparer à ce que vous payez aujourd’hui en gaz, en fioul ou en électricité. C’est l’objet du simulateur et des pages ${h.a('pompe-a-chaleur-ou-chaudiere-gaz', 'PAC ou chaudière gaz')} et ${h.a('rentabilite-pompe-a-chaleur', 'rentabilité')}.</p>`,
  },
  en: {
    slug: 'heat-pump-running-cost',
    nav: 'Heat pump running cost',
    card: 'kWh of electricity per year and cost for your département’s real climate.',
    title: 'Heat pump running cost France: kWh and cost by département',
    description: 'Heat pump running costs in France: kWh of electricity per year and cost from your département’s heating degree-days, ADEME’s measured efficiency, 2026 tariff.',
    h1: 'Heat pump running cost: the calculation for your climate',
    intro: 'A heat pump does not use the same in Nice as in Strasbourg. The calculation starts from the degree-days measured by Météo-France in your département.',
    resume: (h) => {
      const d = h.dep('69'), b = h.M.besoinChauffage(100, 'moyenne', d.dju), k = b / h.P.rendements.scop.air_eau;
      return `A heat pump’s consumption is worked out in two steps. First, the heat the house needs over the year, which depends on its area, its insulation and the climate, measured in heating degree-days (DJU): the day-by-day sum of the gap between 18 °C and the average outdoor temperature. Second, the heat pump’s yearly efficiency, or SCOP: the kWh of heat produced per kWh of electricity used. ADEME measured, on real installations, an average efficiency of ${h.num(h.P.rendements.scop.air_eau, 1)} for air-to-water, ranging from ${h.num(h.P.rendements.scop.air_eau_min, 1)} to ${h.num(h.P.rendements.scop.air_eau_max, 1)} depending on fitting and settings, and ${h.num(h.P.rendements.scop.geo, 1)} for ground-source. For an averagely insulated 100 m² house in the Rhône (${h.num(d.dju)} HDD), about ${h.num(b)} kWh of heat is needed, which is ${h.num(k)} kWh of electricity for air-to-water: ${h.eur(k * h.P.energie.electricite.kwh_ttc)} a year at the regulated tariff. These are estimates; your current consumption, entered in the calculator, replaces them.`;
    },
    faqs: (h) => [
      { q: 'Do I need a bigger electricity supply for a heat pump?', a: `Often not for a properly sized air-to-water heat pump in a house already on 9 kVA, but the installer must check, especially if the heat pump has a backup heater. A Base 9 kVA regulated-tariff subscription costs ${h.eur(h.P.energie.electricite.abonnement_9kva_ttc, 2)} a year since ${h.dateElec}; moving to a higher rating increases that amount.` },
      { q: 'Why does my heat pump use more than expected?', a: 'The commonest causes are radiator water set too hot, a backup heater kicking in too early, oversizing that makes the heat pump run in short cycles, or a winter colder than average. ADEME’s study found efficiencies varying by a factor of more than two depending on the quality of fitting and settings.' },
      { q: 'Does the consumption include hot water?', a: 'Not in this calculation: it covers space heating only. An air-to-water heat pump that also heats water uses more, roughly a few hundred to a thousand kWh of electricity a year depending on the number of people and efficiency. Degree-days only measure the heating need.' },
    ],
    body: (h) => `<h2>Consumption and cost, département by département</h2>
${grille(h)}
<p>All 96 départements are in the table on the ${h.a('pompe-a-chaleur-par-departement', 'heat pump by département')} page. Each département’s degree-days are those of the Météo-France station nearest its main town; in the calculator you can pick another station, in the mountains for example.</p>
<!--mini:conso-->
<h2>Real efficiency, not the data-sheet figure</h2>
<p>Manufacturers quote a coefficient of performance (COP) measured in a laboratory at an outdoor temperature of 7 °C, often above 4. Real yearly efficiency is lower: it includes cold days, defrosting, hot radiator water and stoppages. That is why the site starts from ${h.src('ademe', 'ADEME')}’s measurements in occupied houses. If your installer gives you a SCOP, you can enter it under “Refine”; the calculator recomputes the consumption.</p>
<h2>What lowers consumption</h2>
<p>Low water temperature: the hotter the radiator water, the harder the heat pump works. Underfloor heating and oversized radiators are the best emitters. A well-set weather compensation curve, which adapts water temperature to outdoor temperature. Correct sizing (see ${h.a('puissance-pompe-a-chaleur', 'heat pump sizing')}). And of course insulation: going from an average to a well insulated house cuts the heating need by about a third in the site’s calculation.</p>
<h2>Compare with your current bill</h2>
<p>Consumption alone does not tell you whether a heat pump is worthwhile: it must be compared with what you pay today for gas, oil or electricity. That is the job of the calculator and of the ${h.a('pompe-a-chaleur-ou-chaudiere-gaz', 'heat pump or gas boiler')} and ${h.a('rentabilite-pompe-a-chaleur', 'payback')} pages.</p>`,
  },
});
