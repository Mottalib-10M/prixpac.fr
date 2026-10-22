/** Configuration centrale du site (générée par new-site.py). */
import FICHIER from './pac/fichier.json';
export const SITE_URL = "https://fr-pompe-a-chaleur.example";
export const SITE_NAMES: Record<string, string> = {"fr": "Calcul PAC", "en": "Calcul PAC"};
/** Une locale par langue (RECETTE §4) : les nombres anglais s'écrivent « €1,234 », jamais « 1 234 € ». */
export const LOCALE_BY_LANG: Record<string, string> = { fr: 'fr-FR', en: 'en-GB' };
export const LANG_TAGS: Record<string, string> = {"fr": "fr-FR", "en": "en-FR"};
export const OG_LOCALES: Record<string, string> = {"fr": "fr_FR", "en": "en_GB"};
export const LOCALE_TAG = 'fr-FR';
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
/** Date de la donnée la plus récente lue par scripts/update-data.mjs : c'est la date affichée sur chaque page. */
export const LAST_UPDATED: string = FICHIER.fichier;
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"fr": "Éditeur d'un calculateur neutre du coût, des aides et de l'économie d'une pompe à chaleur, sans demande de devis", "en": "Publisher of a neutral calculator of the cost, grants and savings of a heat pump in France, with no quote request"};
export const AUTHOR_DESC: Record<string, string> = {"fr": "Radif Partners calcule le besoin de chauffage de chaque département à partir des relevés quotidiens de Météo-France, applique le barème MaPrimeRénov' 2026, la fiche CEE BAR-TH-171 et le reste à charge minimal du décret, et affiche le prix, l'aide et l'économie d'une pompe à chaleur sans vous demander de coordonnées.", "en": "Radif Partners works out the heating need of every French département from Météo-France daily records, applies the 2026 MaPrimeRénov' scale, the BAR-TH-171 energy-savings certificate sheet and the legal minimum out-of-pocket share, and shows a heat pump's price, grant and savings without asking for your details."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"fr": ["MaPrimeRénov' 2026 pour une pompe à chaleur", "Prime CEE et Coup de pouce chauffage (BAR-TH-171)", "Degrés-jours unifiés par département", "Consommation réelle d'une pompe à chaleur (SCOP)", "Plafonds de ressources de l'ANAH"], "en": ["MaPrimeRénov' 2026 for a heat pump", "Energy-savings certificates and the Coup de pouce heating bonus", "Heating degree days by French département", "Real-world heat pump efficiency (SCOP)", "ANAH income ceilings"]};
export const CONTACT_EMAIL = "contact@fr-pompe-a-chaleur.example";
export const THEME_COLOR = '#0F6E5A';
export const LOGO_SYMBOL = 'PAC';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = '';
export const INDEXNOW_KEY = '8c41e6b2d7f94a03b5e1c27d9a6f4e18';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',            // raison sociale ou nom commercial exploité
  legalForm: '',             // ex. entreprise individuelle, SASU, GmbH, eenmanszaak
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "TVA",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
