import type { Locale } from './routes';
const fr = {
  updatedOn: 'Mis à jour le', editorialPolicy: 'Charte éditoriale', contactLabel: 'Contact', reviewedBy: 'Vérifié par',
  skipToContent: 'Aller au contenu', mainNav: 'Navigation principale', breadcrumbLabel: 'Fil d’Ariane', breadcrumbHome: 'Accueil', menuOpen: 'Ouvrir le menu',
  faqTitle: 'Questions fréquentes', relatedCalculators: 'Pages et calculs associés', sourcesTitle: 'Sources', writtenBy: 'Rédigé par',
  asOf: 'Données', lastUpdated: 'relues le', footerValidated: 'Sources : Service-Public, Légifrance, registre Emmy, Météo-France, CRE, ADEME (citées sur chaque page)', footerBrowser: 'Sans compte · sans devis · aucun numéro demandé · gratuit',
  footerDisclaimer: 'Site indépendant édité par Radif Partners. Ce n’est pas un site de l’Anah, de France Rénov’ ni d’un installateur : aucun lien commercial, aucune mise en relation, aucune commission. Les montants sont des estimations calculées sur les barèmes publiés : seule l’Anah fixe MaPrimeRénov’, et la prime CEE est celle que l’entreprise vous écrit avant signature.', footerPopular: '', notFound: 'Cette page n’existe pas.',
  readMore: 'Lire la suite',
};
const en: typeof fr = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related pages and calculations', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Data', lastUpdated: 'reread on', footerValidated: 'Sources: Service-Public, Légifrance, Emmy registry, Météo-France, CRE, ADEME (cited on every page)', footerBrowser: 'No account · no quote · no phone number asked · free',
  footerDisclaimer: 'Independent site published by Radif Partners. It is not a site of the Anah, France Rénov’ or any installer: no commercial link, no referrals, no commission. Amounts are estimates only, worked out from the published scales: only the Anah sets MaPrimeRénov’, and the CEE bonus is the one the firm puts in writing before you sign.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : fr; }
