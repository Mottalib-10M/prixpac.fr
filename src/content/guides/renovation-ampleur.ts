import { defineGuide, type Helpers } from '../../lib/guide-types';

const COUL = [['bleu', 'Bleu', 'Blue'], ['jaune', 'Jaune', 'Yellow'], ['violet', 'Violet', 'Purple'], ['rose', 'Rose', 'Pink']] as const;

/** Aide d'ampleur pour un bouquet type, par couleur et gain de classes (moteur du site). */
const bareme = (h: Helpers, ht: number) => {
  const fr = h.lang === 'fr', A = h.P.maprimerenov.ampleur;
  const rows = COUL.map(([k, f, e]) => {
    const a2 = h.M.ampleur(ht, k, 2), a3 = h.M.ampleur(ht, k, 3);
    return [fr ? f : e, h.pct(A.taux_ht[k], 0), h.eur(a2.aide), h.eur(a3.aide), h.pct(A.ecretement_ttc[k], 0)];
  });
  return h.table(fr ? ['Couleur', 'Taux', 'Aide, 2 classes gagnées', 'Aide, 3 classes et plus', 'Aides au plus (part du TTC)'] : ['Colour', 'Rate', 'Grant, 2 classes gained', 'Grant, 3+ classes', 'Grants at most (share of cost incl. VAT)'], rows,
    fr ? `Bouquet hypothétique de ${h.eur(ht)} hors taxes ; dépense retenue au plus ${h.eur(A.plafond_2_classes)} (2 classes) ou ${h.eur(A.plafond_3_classes)} (3 classes et plus), barème au ${h.date(A.verifie_le)}` : `Hypothetical ${h.eur(ht)} package before VAT; expense counted at most ${h.eur(A.plafond_2_classes)} (2 classes) or ${h.eur(A.plafond_3_classes)} (3+ classes), scale as of ${h.date(A.verifie_le)}`, ['l', 'r', 'r', 'r', 'r']);
};

const compare = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = COUL.slice(0, 3).map(([k, f, e]) => {
    const rfr = { bleu: 20000, jaune: 35000, violet: 50000 }[k];
    const g = h.M.simuler({ ...h.M.DEFAUT, rfr });
    return [fr ? f : e, h.eur(g.mpr + g.cee.eur), h.eur(h.M.ampleur(45000, k, 2).aide)];
  });
  return h.table(fr ? ['Couleur', 'PAC seule : MaPrimeRénov’ + CEE', 'Ampleur : PAC + isolation, 45 000 € HT'] : ['Colour', 'Heat pump alone: MaPrimeRénov’ + CEE', 'Whole-home: heat pump + insulation, €45,000 before VAT'], rows,
    fr ? `PAC seule : air/eau au prix médian de ${h.eur(h.P.prix_installation.air_eau.median_ttc)}, maison de 100 m² dans le Rhône, chaudière gaz, 3 personnes ; ampleur : 2 classes gagnées. Les deux voies ne se cumulent pas pour les mêmes travaux.` : `Heat pump alone: air-to-water at the ${h.eur(h.P.prix_installation.air_eau.median_ttc)} median price, 100 m² house in the Rhône, gas boiler, 3 people; whole-home: 2 classes gained. The two routes do not combine for the same work.`, ['l', 'r', 'r']);
};

/** Aide d'un ménage violet selon le budget HT et le gain de classes (moteur du site). */
const budgets = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = [20000, 30000, 40000, 50000].map((ht) => [h.eur(ht), h.eur(h.M.ampleur(ht, 'violet', 2).aide), h.eur(h.M.ampleur(ht, 'violet', 3).aide)]);
  return h.table(fr ? ['Travaux HT', 'Gain de 2 classes', 'Gain de 3 classes ou plus'] : ['Work excl. VAT', '2-class gain', '3 classes or more'], rows,
    fr ? 'MaPrimeRénov’ rénovation d’ampleur d’un ménage violet, avant écrêtement et hors accompagnateur' : 'Whole-home MaPrimeRénov’ for a purple household, before the cap and excluding the adviser', ['r', 'r', 'r']);
};

export default defineGuide({
  id: 'renovation-ampleur',
  group: 'aides',
  order: 11,
  mini: 'ampleur',
  related: ['maprimerenov-pompe-a-chaleur', 'maprimerenov-rose', 'eco-ptz-pompe-a-chaleur', 'puissance-pompe-a-chaleur', 'plafonds-revenus-maprimerenov'],
  sources: ['spMpr', 'franceRenov'],
  fr: {
    slug: 'renovation-ampleur',
    nav: 'Rénovation d’ampleur',
    card: 'PAC + isolation : jusqu’à 80 % du coût HT, deux classes de DPE gagnées.',
    title: 'Rénovation d’ampleur 2026 : PAC et isolation, taux, plafonds',
    description: 'MaPrimeRénov’ rénovation d’ampleur 2026 : pompe à chaleur et isolation dans un même projet, 80 à 10 % du coût hors taxes selon les revenus, conditions de DPE.',
    h1: 'Rénovation d’ampleur : la pompe à chaleur dans un projet complet',
    intro: 'Changer seulement le chauffage relève de MaPrimeRénov’ par geste. Isoler en même temps ouvre une autre aide, calculée en pourcentage du coût.',
    resume: (h) => {
      const A = h.P.maprimerenov.ampleur;
      return `MaPrimeRénov’ rénovation d’ampleur finance un projet de travaux qui fait gagner au moins deux classes au diagnostic de performance énergétique (DPE). Elle est réservée aux logements classés ${A.dpe_avant.join(', ')} avant travaux, achevés depuis au moins ${h.num(h.P.maprimerenov.anciennete_logement_ans_autres)} ans. Le projet doit comprendre au moins ${h.num(A.gestes_isolation_min)} travaux d’isolation parmi les murs, les planchers bas, la toiture et les fenêtres, chacun sur au moins ${h.pct(A.part_surface_geste_min, 0)} de la surface concernée ; la pompe à chaleur s’y ajoute. L’aide est un pourcentage du coût hors taxes : ${h.pct(A.taux_ht.bleu, 0)} pour un ménage bleu, ${h.pct(A.taux_ht.jaune, 0)} pour un jaune, ${h.pct(A.taux_ht.violet, 0)} pour un violet et ${h.pct(A.taux_ht.rose, 0)} pour un rose, sur ${h.eur(A.plafond_2_classes)} au plus pour deux classes gagnées et ${h.eur(A.plafond_3_classes)} pour trois ou plus. Un accompagnateur Rénov’ est obligatoire. Depuis le 1er septembre 2026, une maison qui garde un chauffage au gaz, ou une PAC hybride avec appoint fossile, n’est plus financée. Le simulateur du site chiffre la PAC seule ; le mini-calcul de cette page, le bouquet complet.`;
    },
    faqs: (h) => [
      { q: 'Peut-on cumuler la rénovation d’ampleur et MaPrimeRénov’ par geste ?', a: 'Pas pour les mêmes travaux : la pompe à chaleur est financée soit par geste, soit dans le projet d’ampleur. Le choix dépend du projet. Si vous n’isolez pas, seul le geste est possible ; si votre logement est classé E, F ou G et que vous isolez, l’ampleur rapporte en général bien plus. La prime CEE peut s’ajouter dans les deux cas, dans la limite de l’écrêtement.' },
      { q: 'Combien coûte l’accompagnateur Rénov’ ?', a: `Sa mission est financée par l’Anah selon les revenus : ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.bleu, 0)} pour un ménage bleu, ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.jaune, 0)} pour un jaune, ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.violet, 0)} pour un violet et ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.rose, 0)} pour un rose, dans la limite de ${h.eur(h.P.maprimerenov.ampleur.accompagnateur_plafond)} (${h.eur(h.P.maprimerenov.ampleur.accompagnateur_plafond_precarite)} dans certains logements très dégradés). Demandez le prix de sa prestation avant de signer.` },
      { q: 'Une PAC hybride gaz est-elle encore financée en rénovation d’ampleur ?', a: 'Non, depuis le 1er septembre 2026 : l’aide ne peut plus être accordée pour une maison individuelle qui garde un chauffage au gaz après travaux, et les pompes à chaleur hybrides avec appoint au gaz ou au fioul ne sont plus finançables. Une PAC air/eau ou géothermique seule reste éligible, avec l’isolation exigée.' },
    ],
    body: (h) => `<h2>Le barème 2026</h2>
${bareme(h, 45000)}
<p>La dernière colonne est l’écrêtement propre à la rénovation d’ampleur : toutes les aides réunies ne peuvent pas dépasser cette part du coût TTC. Il est plus large que celui des gestes, et le ménage bleu peut en théorie être aidé à ${h.pct(h.P.maprimerenov.ampleur.ecretement_ttc.bleu, 0)}.</p>
<!--mini:ampleur-->
<h2>PAC seule ou projet complet : ordre de grandeur</h2>
${compare(h)}
<p>Le projet complet coûte plus cher, mais l’aide est sans commune mesure, et une maison isolée a besoin d’une PAC plus petite (voir ${h.a('puissance-pompe-a-chaleur', 'la puissance d’une PAC')}). Pour un ménage rose, le taux de ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} change moins la donne.</p>
<h2>Comment se déroule un projet</h2>
<p>1. Rendez-vous avec un conseiller ${h.src('franceRenov', 'France Rénov’')}, gratuit et obligatoire. 2. Choix d’un accompagnateur Rénov’, qui fait l’audit énergétique et propose un scénario de travaux. 3. Devis d’entreprises RGE, dépôt du dossier et accord de l’Anah avant de commencer. 4. Travaux, en une ou deux étapes : si une seconde étape est prévue, elle doit amener le logement au moins en classe C (ou B s’il partait de E). 5. DPE après travaux et versement de l’aide.</p>
<h2>Le plafond selon le gain de classes</h2>
${budgets(h)}
<p>Au-delà de ${h.eur(h.P.maprimerenov.ampleur.plafond_2_classes)} de travaux pour deux classes, ou ${h.eur(h.P.maprimerenov.ampleur.plafond_3_classes)} pour trois, chaque euro de plus est à votre charge. Viser une classe de plus peut donc relever l’aide, si l’audit montre que c’est possible. Demandez à l’accompagnateur deux scénarios chiffrés, deux classes et trois, avec leur coût et leur aide, avant de choisir.</p>
<h2>Le projet de loi de finances 2027</h2>
<p>Le projet pour 2027, non voté, prévoit de financer les pompes à chaleur par les seuls CEE ; il ne dit pas encore clairement comment la PAC serait traitée dans une rénovation d’ampleur. C’est à suivre : la page sera mise à jour après le vote.</p>`,
  },
  en: {
    slug: 'whole-home-renovation-grant',
    nav: 'Whole-home renovation',
    card: 'Heat pump + insulation: up to 80% of the cost before VAT, two energy classes gained.',
    title: 'Whole-home renovation grant 2026: heat pump and insulation',
    description: 'MaPrimeRénov’ whole-home renovation in 2026: a heat pump and insulation in one project, 80% to 10% of the cost before VAT by income, and the rating rules.',
    h1: 'Whole-home renovation: the heat pump in a full project',
    intro: 'Changing only the heating falls under per-item MaPrimeRénov’. Insulating at the same time opens another grant, worked out as a share of the cost.',
    resume: (h) => {
      const A = h.P.maprimerenov.ampleur;
      return `Whole-home MaPrimeRénov’ (“rénovation d’ampleur”) funds a project gaining at least two classes on the energy performance certificate (DPE). It is reserved for homes rated ${A.dpe_avant.join(', ')} before work and completed at least ${h.num(h.P.maprimerenov.anciennete_logement_ans_autres)} years ago. The project must include at least ${h.num(A.gestes_isolation_min)} insulation jobs among walls, low floors, roof and windows, each covering at least ${h.pct(A.part_surface_geste_min, 0)} of the area concerned; the heat pump comes on top. The grant is a share of the cost before VAT: ${h.pct(A.taux_ht.bleu, 0)} for a blue household, ${h.pct(A.taux_ht.jaune, 0)} for yellow, ${h.pct(A.taux_ht.violet, 0)} for purple and ${h.pct(A.taux_ht.rose, 0)} for pink, on at most ${h.eur(A.plafond_2_classes)} for two classes gained and ${h.eur(A.plafond_3_classes)} for three or more. A Mon Accompagnateur Rénov’ adviser is mandatory. Since 1 September 2026, a house keeping gas heating, or a hybrid heat pump with fossil backup, is no longer funded. The site’s calculator costs the heat pump alone; this page’s mini-calculator costs the full package.`;
    },
    faqs: (h) => [
      { q: 'Can whole-home and per-item MaPrimeRénov’ be combined?', a: 'Not for the same work: the heat pump is funded either per item or within the whole-home project. The choice depends on the project. If you do not insulate, only the per-item grant is possible; if your home is rated E, F or G and you insulate, whole-home usually pays far more. The CEE bonus can be added in both cases, within the cap.' },
      { q: 'How much does the renovation adviser cost?', a: `The adviser’s work is funded by Anah according to income: ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.bleu, 0)} for blue, ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.jaune, 0)} for yellow, ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.violet, 0)} for purple and ${h.pct(h.P.maprimerenov.ampleur.accompagnateur_taux.rose, 0)} for pink households, up to ${h.eur(h.P.maprimerenov.ampleur.accompagnateur_plafond)} (${h.eur(h.P.maprimerenov.ampleur.accompagnateur_plafond_precarite)} in some badly degraded homes). Ask for the price of the service before signing.` },
      { q: 'Is a gas hybrid heat pump still funded in a whole-home renovation?', a: 'No, since 1 September 2026: the grant can no longer be given for a house that keeps gas heating after the work, and hybrid heat pumps with gas or oil backup can no longer be funded. A standalone air-to-water or ground-source heat pump remains eligible, with the required insulation.' },
    ],
    body: (h) => `<h2>The 2026 scale</h2>
${bareme(h, 45000)}
<p>The last column is the whole-home cap: all grants together cannot exceed that share of the cost including VAT. It is wider than the per-item cap, and a blue household can in theory be funded up to ${h.pct(h.P.maprimerenov.ampleur.ecretement_ttc.bleu, 0)}.</p>
<!--mini:ampleur-->
<h2>Heat pump alone or full project: order of magnitude</h2>
${compare(h)}
<p>The full project costs more, but the grant is in another league, and an insulated house needs a smaller heat pump (see ${h.a('puissance-pompe-a-chaleur', 'heat pump sizing')}). For a pink household, the ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} rate changes less.</p>
<h2>How a project runs</h2>
<p>1. An appointment with a ${h.src('franceRenov', 'France Rénov’')} adviser, free and mandatory. 2. Choice of a Mon Accompagnateur Rénov’ adviser, who carries out the energy audit and proposes a works plan. 3. Quotes from RGE firms, filing the application and Anah approval before starting. 4. Work, in one or two stages: if a second stage is planned, it must bring the home to at least class C (or B if it started at E). 5. Energy certificate after the work and payment of the grant.</p>
<h2>The ceiling by number of classes gained</h2>
${budgets(h)}
<p>Above ${h.eur(h.P.maprimerenov.ampleur.plafond_2_classes)} of work for two classes, or ${h.eur(h.P.maprimerenov.ampleur.plafond_3_classes)} for three, every extra euro is yours to pay. Aiming for one more class can therefore raise the grant, if the audit shows it can be done. The rate applied depends on the colour: ${h.pct(h.P.maprimerenov.ampleur.taux_ht.bleu, 0)} of the cost excluding VAT for blue, ${h.pct(h.P.maprimerenov.ampleur.taux_ht.jaune, 0)} for yellow, ${h.pct(h.P.maprimerenov.ampleur.taux_ht.violet, 0)} for purple and ${h.pct(h.P.maprimerenov.ampleur.taux_ht.rose, 0)} for pink, so the same budget produces very different grants from one household to the next.</p>
<p>The table stops before the cap and leaves out the adviser’s fee, which is funded separately. To see the effect of the cap, which limits all grants together to a share of the cost including VAT, use the calculator above with your own budget and colour: it applies the 2026 scale, then the cap, and shows the amount actually paid. For a project that combines insulation and a heat pump, ask the adviser for two scenarios, two classes and three, with their cost and their grant, before choosing.</p>
<h2>The 2027 draft budget</h2>
<p>The 2027 draft, not yet voted, plans to fund heat pumps through CEE alone; it does not yet say clearly how a heat pump within a whole-home renovation would be treated. This is one to watch: the page will be updated after the vote.</p>`,
  },
});
