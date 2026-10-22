import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Gain du Coup de pouce pour une maison de 100 m² : prime sans et avec, par zone et type de PAC (moteur du site). */
const gain = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows: string[][] = [];
  for (const type of ['air_eau', 'geo'] as const) for (const z of ['H1', 'H2', 'H3'] as const) {
    const o = { type, logement: 'maison' as const, surface: 100, zone: z, etasHaut: false };
    const sans = h.M.cee({ ...o, coupDePouce: false, couleur: 'violet' }), avec = h.M.cee({ ...o, coupDePouce: true, couleur: 'violet' }), prec = h.M.cee({ ...o, coupDePouce: true, couleur: 'bleu' });
    rows.push([type === 'geo' ? (fr ? 'Géothermique' : 'Ground-source') : (fr ? 'Air/eau' : 'Air-to-water'), z, h.eur(sans.eur), h.eur(avec.eur), h.eur(prec.eur)]);
  }
  return h.table(fr ? ['PAC', 'Zone', 'Sans Coup de pouce', 'Avec (violet, rose)', 'Avec (bleu, jaune)'] : ['Heat pump', 'Zone', 'Without Coup de pouce', 'With (purple, pink)', 'With (blue, yellow)'], rows,
    fr ? `Maison de 100 m², efficacité saisonnière du palier bas ; valeur au prix moyen Emmy de ${h.moisCee}, classique ou précarité` : `100 m² house, lower seasonal efficiency band; value at the ${h.moisCee} Emmy average price, standard or fuel poverty`, ['l', 'l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'coup-de-pouce-chauffage',
  group: 'aides',
  order: 5,
  tool: 'simulateur',
  preset: { energie: 'fioul' },
  focus: 'cee',
  related: ['prime-cee-pompe-a-chaleur', 'remplacer-chaudiere-fioul', 'pompe-a-chaleur-ou-chaudiere-gaz', 'ecretement-maprimerenov', 'maprimerenov-pompe-a-chaleur'],
  sources: ['coupDePouce', 'coupDePouce2025', 'bar171', 'bar172', 'emmy', 'spMpr'],
  fr: {
    slug: 'coup-de-pouce-chauffage',
    nav: 'Coup de pouce Chauffage',
    card: 'Prime CEE ×5 si la PAC remplace une chaudière fioul, gaz ou charbon.',
    title: 'Coup de pouce Chauffage 2026 : prime ×5 pour une PAC agréée',
    description: 'Coup de pouce Chauffage 2026 : prime CEE multipliée par 5 quand une pompe à chaleur agréée remplace une chaudière fioul, gaz ou charbon : conditions, montant.',
    h1: 'Coup de pouce Chauffage : la prime multipliée par cinq',
    intro: 'Le simulateur part d’une chaudière au fioul. Le Coup de pouce change tout le calcul : sans lui, la prime CEE d’une PAC est cinq fois plus petite.',
    resume: (h) => {
      const c = h.P.cee.coup_de_pouce;
      return `Le Coup de pouce Chauffage est une bonification des certificats d’économies d’énergie. Depuis le 1er octobre 2025 et jusqu’au 31 décembre 2030, il multiplie par ${h.num(c.coefficient)} le volume de kWh cumac des fiches BAR-TH-171 (PAC air/eau) et BAR-TH-172 (PAC géothermique) quand la pompe à chaleur remplace une chaudière individuelle au charbon, au fioul ou au gaz dans une résidence principale ; les résidences secondaires sont exclues. Depuis le 1er septembre 2026, l’arrêté du 29 mai 2026 ajoute une condition : le modèle de PAC doit être agréé au titre du décret n° 2026-413, et son numéro figure sur la facture. Les radiateurs électriques remplacés n’y donnent pas droit. Pour une maison de 100 m² en zone H2, la prime passe ainsi de ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: false, couleur: 'violet' }).eur)} à ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'violet' }).eur)} en air/eau, au prix moyen du registre. L’offre doit être acceptée avant la signature du devis.`;
    },
    faqs: (h) => [
      { q: 'Une chaudière gaz à condensation récente ouvre-t-elle droit au Coup de pouce ?', a: 'Oui : le texte vise les chaudières individuelles au charbon, au fioul ou au gaz, sans condition d’âge ni de technologie. Une chaudière à condensation de quelques années compte donc. Remplacer une chaudière récente en bon état reste un choix à peser : le simulateur compare la facture avant et après pour savoir si l’économie justifie la dépense.' },
      { q: 'Comment savoir si un modèle de pompe à chaleur est agréé ?', a: 'Demandez à l’installateur, avant de signer, le numéro d’agrément du modèle prévu au décret n° 2026-413 ; il doit figurer sur la facture. Pour des travaux engagés depuis le 1er septembre 2026, sans modèle agréé à la date d’engagement, la prime retombe au volume de base de la fiche, cinq fois plus faible.' },
      { q: 'Le Coup de pouce se cumule-t-il avec MaPrimeRénov’ ?', a: `Oui, dans la limite de l’écrêtement : les aides réunies ne peuvent pas dépasser ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} de la dépense pour un ménage violet, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} pour un bleu. Comme le Coup de pouce rend la prime CEE très élevée, c’est souvent MaPrimeRénov’ qui baisse. Le simulateur affiche les deux montants après écrêtement.` },
    ],
    body: (h) => `<h2>Combien rapporte le Coup de pouce</h2>
${gain(h)}
<p>Ce sont des valeurs au prix moyen du marché ; l’offre réelle dépend du fournisseur qui achète vos certificats. Le prix « précarité » s’applique aux ménages bleus et jaunes. La géothermie, avec un volume de base plus élevé et une durée de vie conventionnelle de ${h.num(h.P.cee.bar_th_172.duree_vie_ans)} ans, rapporte davantage.</p>
<h2>Les conditions, dans l’ordre</h2>
<p>1. Une résidence principale, maison ou appartement. 2. Une chaudière individuelle au charbon, au fioul ou au gaz déposée, ce qui doit figurer sur l’attestation sur l’honneur et la facture. 3. Une PAC qui respecte la fiche BAR-TH-171 ou BAR-TH-172 (efficacité saisonnière minimale, pose par un professionnel RGE, note de dimensionnement). 4. Depuis le 1er septembre 2026, un modèle agréé. 5. Une offre Coup de pouce acceptée avant de signer le devis : c’est le « rôle actif et incitatif » de l’entreprise qui finance la prime.</p>
<h2>Fioul : la dépose de la cuve est aidée à part</h2>
<p>Remplacer une chaudière au fioul impose de neutraliser ou d’enlever la cuve. MaPrimeRénov’ prévoit un forfait pour la dépose de cuve à fioul : ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.bleu)} pour un ménage bleu, ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.jaune)} pour un jaune, ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.violet)} pour un violet, sur une dépense de ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.plafond_depense)} au plus. Le reste du raisonnement est sur la page ${h.a('remplacer-chaudiere-fioul', 'remplacer une chaudière fioul')}.</p>
<h2>Après 2026</h2>
<p>Le coefficient de cinq est fixé jusqu’au 31 décembre 2030. Le projet de loi de finances pour 2027, non voté, prévoit de financer les pompes à chaleur uniquement par les certificats d’économies d’énergie : si c’est adopté, le Coup de pouce deviendrait l’aide principale. Rien n’est décidé à ce jour.</p>`,
  },
  en: {
    slug: 'coup-de-pouce-heating-bonus',
    nav: 'Coup de pouce heating bonus',
    card: 'CEE bonus ×5 when the heat pump replaces an oil, gas or coal boiler.',
    title: 'Coup de pouce heating bonus 2026: ×5 for an approved model',
    description: 'Coup de pouce Chauffage in 2026: CEE bonus multiplied by 5 when an approved heat pump replaces an oil, gas or coal boiler in France: conditions and amounts.',
    h1: 'Coup de pouce Chauffage: the bonus multiplied by five',
    intro: 'The calculator starts from an oil boiler. The Coup de pouce changes the whole sum: without it, a heat pump’s CEE bonus is five times smaller.',
    resume: (h) => {
      const c = h.P.cee.coup_de_pouce;
      return `The Coup de pouce Chauffage is a bonus on energy saving certificates. From 1 October 2025 until 31 December 2030 it multiplies by ${h.num(c.coefficient)} the kWh cumac volume of sheets BAR-TH-171 (air-to-water) and BAR-TH-172 (ground-source) when the heat pump replaces an individual coal, oil or gas boiler in a main residence; second homes are excluded. Since 1 September 2026, the order of 29 May 2026 adds a condition: the heat pump model must be approved under decree no. 2026-413, and its number appears on the invoice. Replacing electric heaters does not qualify. For a 100 m² house in zone H2, the bonus thus rises from ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: false, couleur: 'violet' }).eur)} to ${h.eur(h.M.cee({ type: 'air_eau', logement: 'maison', surface: 100, zone: 'H2', etasHaut: false, coupDePouce: true, couleur: 'violet' }).eur)} for air-to-water, at the registry average price. The offer must be accepted before signing the quote.`;
    },
    faqs: (h) => [
      { q: 'Does a recent gas condensing boiler qualify for the Coup de pouce?', a: 'Yes: the text covers individual coal, oil or gas boilers, with no condition on age or technology. A condensing boiler a few years old therefore counts. Replacing a recent boiler in good order is still a choice to weigh: the calculator compares the bill before and after to see whether the saving justifies the outlay.' },
      { q: 'How do I know whether a heat pump model is approved?', a: 'Before signing, ask the installer for the model’s approval number under decree no. 2026-413; it must appear on the invoice. For work committed since 1 September 2026, without a model approved at the commitment date, the bonus falls back to the sheet’s basic volume, five times smaller.' },
      { q: 'Can the Coup de pouce be combined with MaPrimeRénov’?', a: `Yes, within the cap: total grants cannot exceed ${h.pct(1 - h.P.ecretement.reste_a_charge_min.violet, 0)} of the expense for a purple household, ${h.pct(1 - h.P.ecretement.reste_a_charge_min.bleu, 0)} for blue. As the Coup de pouce makes the CEE bonus very high, MaPrimeRénov’ is often reduced. The calculator shows both amounts after the cap.` },
    ],
    body: (h) => `<h2>What the Coup de pouce is worth</h2>
${gain(h)}
<p>These are values at the average market price; the real offer depends on the supplier buying your certificates. The fuel-poverty price applies to blue and yellow households. Ground-source, with a higher base volume and a ${h.num(h.P.cee.bar_th_172.duree_vie_ans)}-year conventional lifetime, is worth more.</p>
<h2>The conditions, in order</h2>
<p>1. A main residence, house or flat. 2. An individual coal, oil or gas boiler removed, which must appear on the sworn statement and the invoice. 3. A heat pump meeting sheet BAR-TH-171 or BAR-TH-172 (minimum seasonal efficiency, fitted by an RGE professional, sizing note). 4. Since 1 September 2026, an approved model. 5. A Coup de pouce offer accepted before signing the quote: this is the “active and incentive role” of the firm funding the bonus.</p>
<h2>Oil: removing the tank is funded separately</h2>
<p>Replacing an oil boiler means neutralising or removing the tank. MaPrimeRénov’ has a flat rate for oil tank removal: ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.bleu)} for a blue household, ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.jaune)} for yellow, ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.violet)} for purple, on an expense of at most ${h.eur(h.P.maprimerenov.forfaits.depose_cuve_fioul.plafond_depense)}. The rest of the reasoning is on the ${h.a('remplacer-chaudiere-fioul', 'replacing an oil boiler')} page.</p>
<h2>After 2026</h2>
<p>The factor of five is set until 31 December 2030. The 2027 draft budget, not yet voted, plans to fund heat pumps solely through energy saving certificates: if adopted, the Coup de pouce would become the main grant. Nothing has been decided so far.</p>`,
  },
});
