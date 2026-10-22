import { defineGuide, type Helpers } from '../../lib/guide-types';

/** kWh cumac de la fiche BAR-TH-171 (maison) selon la surface et la zone, avec et sans Coup de pouce. */
const grille = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const cas: Array<[number, string]> = [[60, fr ? 'moins de 70 m²' : 'under 70 m²'], [80, fr ? '70 à 89 m²' : '70 to 89 m²'], [120, fr ? '90 m² et plus' : '90 m² and over']];
  const rows = cas.flatMap(([s, lab]) => (['H1', 'H2', 'H3'] as const).map((z) => {
    const base = h.M.cee({ type: 'air_eau', logement: 'maison', surface: s, zone: z, etasHaut: false, coupDePouce: false, couleur: 'violet' });
    const cp = h.M.cee({ type: 'air_eau', logement: 'maison', surface: s, zone: z, etasHaut: false, coupDePouce: true, couleur: 'violet' });
    const cpPrec = h.M.cee({ type: 'air_eau', logement: 'maison', surface: s, zone: z, etasHaut: false, coupDePouce: true, couleur: 'bleu' });
    return [lab, z, h.num(base.kwhc), h.num(cp.kwhc), h.eur(cp.eur), h.eur(cpPrec.eur)];
  }));
  return h.table(fr ? ['Surface chauffée', 'Zone', 'kWh cumac', 'Avec Coup de pouce', 'Valeur (violet, rose)', 'Valeur (bleu, jaune)'] : ['Heated area', 'Zone', 'kWh cumac', 'With Coup de pouce', 'Value (purple, pink)', 'Value (blue, yellow)'], rows,
    fr ? `PAC air/eau en maison, efficacité saisonnière de 111 à 140 % ; valeur au prix moyen Emmy de ${h.moisCee}` : `Air-to-water heat pump in a house, seasonal efficiency 111 to 140%; value at the Emmy average price of ${h.moisCee}`, ['l', 'l', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'prime-cee-pompe-a-chaleur',
  group: 'aides',
  order: 4,
  mini: 'cee',
  related: ['coup-de-pouce-chauffage', 'ecretement-maprimerenov', 'maprimerenov-pompe-a-chaleur', 'pompe-a-chaleur-air-eau', 'pompe-a-chaleur-geothermique', 'climat-degres-jours-departement'],
  sources: ['bar171', 'bar172', 'coupDePouce', 'coupDePouce2025', 'emmy', 'zones'],
  fr: {
    slug: 'prime-cee-pompe-a-chaleur',
    nav: 'Prime CEE pompe à chaleur',
    card: 'kWh cumac officiels, Coup de pouce ×5, valeur au prix du registre.',
    title: 'Prime CEE pompe à chaleur 2026 : kWh cumac et montant réel',
    description: 'Prime CEE pour une pompe à chaleur en 2026 : kWh cumac de la fiche BAR-TH-171, Coup de pouce ×5, zone et surface, valeur en euros au prix du registre Emmy.',
    h1: 'Prime CEE pour une pompe à chaleur : le calcul officiel',
    intro: 'Les sites de primes affichent un montant « jusqu’à ». Voici le volume que fixe la fiche officielle pour votre maison, et ce qu’il vaut sur le marché.',
    resume: (h) => {
      const C = h.P.cee;
      return `La prime CEE d’une pompe à chaleur air/eau se calcule en kilowattheures cumac, avec la fiche d’opération standardisée BAR-TH-171 publiée au Journal officiel. Pour une maison, le volume est de ${h.num(C.bar_th_171.maison.etas_bas)} kWh cumac si l’efficacité saisonnière de la PAC est comprise entre 111 et 140 %, et de ${h.num(C.bar_th_171.maison.etas_haut)} au-delà ; il est multiplié par 0,5 sous 70 m² chauffés, 0,7 de 70 à 89 m², puis par 1,2 en zone climatique H1, 1 en H2 et 0,7 en H3. Le Coup de pouce Chauffage multiplie le tout par ${h.num(C.coup_de_pouce.coefficient)} quand la PAC remplace une chaudière au charbon, au fioul ou au gaz dans une résidence principale. Une entreprise rachète ces certificats au prix qu’elle choisit ; au prix moyen du registre Emmy en ${h.moisCee}, ${h.num(C.prix_mwh.classique, 2)} € le mégawattheure cumac, une maison de 100 m² en zone H2 avec Coup de pouce représente ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'violet' }).eur)}.`;
    },
    faqs: (h) => {
      const C = h.P.cee;
      return [
        { q: 'Qui verse la prime CEE d’une pompe à chaleur ?', a: 'Un « obligé » (fournisseur d’énergie, de carburant ou de fioul) ou un intermédiaire qui travaille pour lui. Il doit intervenir avant la signature du devis : son rôle « actif et incitatif » est une condition de la prime. Si vous signez d’abord et cherchez la prime ensuite, elle est perdue. La prime arrive par virement, chèque ou remise sur la facture.' },
        { q: 'Pourquoi deux sites annoncent-ils deux primes différentes pour la même PAC ?', a: `Parce que le volume de kWh cumac est fixé par la fiche, mais pas le prix auquel chacun le rachète. Au registre Emmy, le prix moyen mensuel a varié en 2026 entre ${h.num(C.prix_mwh.classique_2026[0], 2)} et ${h.num(C.prix_mwh.classique_2026[1], 2)} € le mégawattheure pour les certificats classiques, et bien plus pour les certificats précarité. Comparez les offres en euros par kWh cumac, pas les montants « jusqu’à ».` },
        { q: 'Le Coup de pouce s’applique-t-il si je remplace des radiateurs électriques ?', a: 'Non. Le coefficient de cinq n’existe que si la PAC remplace une chaudière individuelle au charbon, au fioul ou au gaz, et l’attestation doit mentionner l’énergie et l’équipement déposés. Avec des radiateurs électriques, vous gardez la prime CEE de base de la fiche BAR-TH-171, cinq fois plus faible.' },
        { q: 'Qu’est-ce que l’agrément exigé depuis le 1er septembre 2026 ?', a: 'Un décret du 29 mai 2026 a créé un agrément des modèles de pompes à chaleur en matière de qualité et de résilience industrielle. Pour les travaux engagés depuis le 1er septembre 2026, le Coup de pouce ne s’applique que si le modèle installé le détient à la date d’engagement ; son numéro figure sur la facture. Demandez-le à l’installateur avant de signer.' },
      ];
    },
    body: (h) => {
      const C = h.P.cee, a = C.bar_th_171.appartement;
      return `<h2>Ce que dit la fiche BAR-TH-171</h2>
<p>La fiche BAR-TH-171, dans sa version A82.5 publiée au Journal officiel du 30 mai 2026, couvre la mise en place d’une pompe à chaleur air/eau dans un logement existant. Elle pose des conditions techniques : une efficacité énergétique saisonnière (Etas) d’au moins ${h.pct(C.bar_th_171.etas_min_basse_temperature, 0)} pour une PAC basse température et ${h.pct(C.bar_th_171.etas_min_moyenne_haute_temperature, 0)} pour une PAC moyenne ou haute température, une pose par un professionnel qualifié RGE et une note de dimensionnement remise au client. La durée de vie conventionnelle retenue est de ${h.num(C.bar_th_171.duree_vie_ans)} ans : c’est elle qui transforme une économie annuelle en kWh « cumac », cumulés et actualisés sur la durée de vie.</p>
<p>Le volume dépend de trois choses : l’efficacité saisonnière (deux paliers), la surface chauffée par la PAC (trois paliers) et la zone climatique (trois zones). Pour un appartement, les montants sont plus bas : ${h.num(a.etas_bas)} et ${h.num(a.etas_haut)} kWh cumac, avec des paliers de surface à 35 et 60 m². Pour une PAC géothermique, la fiche BAR-TH-172 retient ${h.num(C.bar_th_172.maison.etas_bas)} et ${h.num(C.bar_th_172.maison.etas_haut)} kWh cumac en maison, sur une durée de vie de ${h.num(C.bar_th_172.duree_vie_ans)} ans.</p>
${grille(h)}
<h2>La zone climatique de votre département</h2>
<p>Les zones H1, H2 et H3 sont celles de l’arrêté du 26 octobre 2010 sur la réglementation thermique. La zone H1 couvre le Nord, l’Est, le Centre, l’Île-de-France et une partie du Massif central et des Alpes ; la zone H3, le littoral méditerranéen et la Corse ; tout le reste est en H2. Le simulateur connaît la zone de chacun des 96 départements. Le facteur de zone récompense les climats froids, où une PAC économise davantage : une même maison rapporte 70 % de kWh cumac de plus à Strasbourg qu’à Marseille.</p>
<!--mini:dju-->
<h2>Le Coup de pouce Chauffage, multiplié par cinq</h2>
<p>Depuis le 1er octobre 2025, le Coup de pouce des fiches BAR-TH-171 et BAR-TH-172 ne s’exprime plus en montant minimal mais en coefficient : ×${h.num(C.coup_de_pouce.coefficient)}, jusqu’au 31 décembre 2030, pour une résidence principale où la PAC remplace une chaudière individuelle au charbon, au fioul ou au gaz. Les résidences secondaires en sont exclues. Depuis le 1er septembre 2026, une condition s’ajoute : le modèle de PAC doit être agréé au titre du décret n° 2026-413. En pratique, c’est le Coup de pouce qui fait l’essentiel de la prime : sans lui, une maison de 100 m² en zone H2 ne génère que ${h.num(C.bar_th_171.maison.etas_bas)} kWh cumac.</p>
<h2>Du kWh cumac à l’euro</h2>
<p>Les certificats s’échangent entre entreprises. Le registre national Emmy publie chaque mois le prix moyen des transactions : ${h.num(C.prix_mwh.classique, 2)} € par mégawattheure cumac pour les certificats classiques en ${h.moisCee}, ${h.num(C.prix_mwh.precarite, 2)} € pour les certificats « précarité énergétique », qui naissent des travaux chez les ménages aux revenus modestes et très modestes. Le registre rappelle que ce prix moyen n’est pas un indice de référence : nous l’utilisons pour donner un ordre de grandeur, pas pour prédire l’offre que vous recevrez.</p>
<p>Une offre honnête se compare en euros par kWh cumac. Une prime de ${h.eur(4000)} pour ${h.num(454500)} kWh cumac, c’est ${h.num(4000 / 454.5, 2)} € par mégawattheure : en dessous du prix moyen. Certains installateurs intègrent la prime au devis sous forme de remise ; vérifiez alors que le prix avant remise n’a pas été gonflé d’autant, en comparant avec la ${h.a('prix-pompe-a-chaleur', 'médiane des devis publiés')}.</p>
<h2>Prime CEE et MaPrimeRénov’ : l’écrêtement</h2>
<p>La prime CEE se cumule avec MaPrimeRénov’, mais pas sans limite : les deux ensemble ne peuvent pas dépasser 90 % de la dépense éligible pour un ménage bleu, 75 % pour un jaune et 60 % pour un violet. Une prime CEE élevée réduit donc MaPrimeRénov’. Le calcul complet, avec votre devis et vos revenus, est sur la page ${h.a('ecretement-maprimerenov', 'de l’écrêtement')} et dans le ${h.a('home', 'simulateur')}.</p>`;
    },
  },
  en: {
    slug: 'cee-bonus-heat-pump',
    nav: 'CEE bonus for a heat pump',
    card: 'Official kWh cumac, Coup de pouce ×5, value at the registry price.',
    title: 'CEE heat pump bonus France 2026: kWh cumac and real value',
    description: 'CEE energy-savings bonus for a heat pump in France in 2026: kWh cumac from sheet BAR-TH-171, Coup de pouce ×5, zone and area, value at the Emmy registry price.',
    h1: 'CEE bonus for a heat pump: the official calculation',
    intro: 'Grant sites show an “up to” amount. Here is the volume the official sheet sets for your house, and what it is worth on the market.',
    resume: (h) => {
      const C = h.P.cee;
      return `The CEE bonus for an air-to-water heat pump is calculated in cumulative discounted kilowatt-hours (kWh cumac), using standardised operation sheet BAR-TH-171 published in the French Official Journal. For a house the volume is ${h.num(C.bar_th_171.maison.etas_bas)} kWh cumac if the heat pump’s seasonal efficiency is between 111% and 140%, and ${h.num(C.bar_th_171.maison.etas_haut)} above that; it is multiplied by 0.5 below 70 m² heated, 0.7 from 70 to 89 m², then by 1.2 in climate zone H1, 1 in H2 and 0.7 in H3. The Coup de pouce Chauffage multiplies the whole by ${h.num(C.coup_de_pouce.coefficient)} when the heat pump replaces a coal, oil or gas boiler in a main residence. A firm buys these certificates at the price it chooses; at the Emmy registry’s average price in ${h.moisCee}, €${h.num(C.prix_mwh.classique, 2)} per cumac megawatt-hour, a 100 m² house in zone H2 with the Coup de pouce is worth ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'violet' }).eur)}.`;
    },
    faqs: (h) => {
      const C = h.P.cee;
      return [
        { q: 'Who pays the CEE bonus for a heat pump?', a: 'An “obligated party” (a supplier of energy, motor fuel or heating oil) or an intermediary working for one. It must be involved before you sign the quote: its “active and incentive role” is a condition of the bonus. If you sign first and look for the bonus afterwards, it is lost. The bonus arrives by transfer, cheque or as a discount on the invoice.' },
        { q: 'Why do two sites quote different bonuses for the same heat pump?', a: `Because the volume of kWh cumac is set by the sheet, but not the price each buyer pays for it. At the Emmy registry the average monthly price ranged in 2026 between €${h.num(C.prix_mwh.classique_2026[0], 2)} and €${h.num(C.prix_mwh.classique_2026[1], 2)} per megawatt-hour for standard certificates, and much more for fuel-poverty certificates. Compare offers in euros per kWh cumac, not “up to” amounts.` },
        { q: 'Does the Coup de pouce apply if I replace electric heaters?', a: 'No. The factor of five only exists if the heat pump replaces an individual coal, oil or gas boiler, and the certificate must state the energy and equipment removed. With electric heaters you keep the basic CEE bonus from sheet BAR-TH-171, five times smaller.' },
        { q: 'What is the approval required since 1 September 2026?', a: 'A decree of 29 May 2026 created an approval of heat pump models for quality and industrial resilience. For work committed since 1 September 2026, the Coup de pouce only applies if the model installed holds it on the commitment date; its number appears on the invoice. Ask the installer for it before signing.' },
      ];
    },
    body: (h) => {
      const C = h.P.cee, a = C.bar_th_171.appartement;
      return `<h2>What sheet BAR-TH-171 says</h2>
<p>Sheet BAR-TH-171, in version A82.5 published in the Official Journal of 30 May 2026, covers installing an air-to-water heat pump in an existing home. It sets technical conditions: a seasonal space heating efficiency (Etas) of at least ${h.pct(C.bar_th_171.etas_min_basse_temperature, 0)} for a low-temperature unit and ${h.pct(C.bar_th_171.etas_min_moyenne_haute_temperature, 0)} for a medium- or high-temperature one, installation by an RGE-certified professional, and a sizing note handed to the customer. The conventional lifetime is ${h.num(C.bar_th_171.duree_vie_ans)} years: that is what turns a yearly saving into “cumac” kWh, cumulated and discounted over the lifetime.</p>
<p>The volume depends on three things: seasonal efficiency (two bands), the area heated by the heat pump (three bands) and the climate zone (three zones). For a flat the amounts are lower: ${h.num(a.etas_bas)} and ${h.num(a.etas_haut)} kWh cumac, with area thresholds at 35 and 60 m². For a ground-source heat pump, sheet BAR-TH-172 sets ${h.num(C.bar_th_172.maison.etas_bas)} and ${h.num(C.bar_th_172.maison.etas_haut)} kWh cumac in a house, over a ${h.num(C.bar_th_172.duree_vie_ans)}-year lifetime.</p>
${grille(h)}
<h2>Your département’s climate zone</h2>
<p>Zones H1, H2 and H3 are those of the order of 26 October 2010 on thermal regulations. Zone H1 covers the north, east, centre, Île-de-France and parts of the Massif Central and the Alps; zone H3 the Mediterranean coast and Corsica; everything else is H2. The calculator knows the zone of each of the 96 départements. The zone factor rewards cold climates, where a heat pump saves more: the same house earns 70% more kWh cumac in Strasbourg than in Marseille.</p>
<!--mini:dju-->
<h2>The Coup de pouce Chauffage, times five</h2>
<p>Since 1 October 2025 the Coup de pouce for sheets BAR-TH-171 and BAR-TH-172 is no longer a minimum amount but a factor: ×${h.num(C.coup_de_pouce.coefficient)}, until 31 December 2030, for a main residence where the heat pump replaces an individual coal, oil or gas boiler. Second homes are excluded. Since 1 September 2026 there is a further condition: the heat pump model must be approved under decree 2026-413. In practice the Coup de pouce makes up most of the bonus: without it, a 100 m² house in zone H2 generates only ${h.num(C.bar_th_171.maison.etas_bas)} kWh cumac.</p>
<h2>From kWh cumac to euros</h2>
<p>Certificates are traded between companies. The national Emmy registry publishes the average transaction price every month: €${h.num(C.prix_mwh.classique, 2)} per cumac megawatt-hour for standard certificates in ${h.moisCee}, €${h.num(C.prix_mwh.precarite, 2)} for “fuel poverty” certificates, which arise from work in low and very-low-income households. The registry points out that this average is not a benchmark index: we use it for an order of magnitude, not to predict the offer you will receive.</p>
<p>A fair offer is compared in euros per kWh cumac. A ${h.eur(4000)} bonus for ${h.num(454500)} kWh cumac is €${h.num(4000 / 454.5, 2)} per megawatt-hour: below the average price. Some installers fold the bonus into the quote as a discount; then check that the price before discount has not been inflated by the same amount, against the ${h.a('prix-pompe-a-chaleur', 'median of published quotes')}.</p>
<h2>CEE bonus and MaPrimeRénov’: the cap</h2>
<p>The CEE bonus can be combined with MaPrimeRénov’, but not without limit: together they may not exceed 90% of the eligible expense for a blue household, 75% for yellow and 60% for purple. A high CEE bonus therefore cuts MaPrimeRénov’. The full calculation, with your quote and income, is on the ${h.a('ecretement-maprimerenov', 'grant cap page')} and in the ${h.a('home', 'calculator')}.</p>`;
    },
  },
});
