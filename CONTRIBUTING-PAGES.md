# Ajouter ou modifier une page de Calcul PAC (fr-pompe-a-chaleur)

À lire avec `~/Documents/GitHub/RECETTE-SITE.md` §6 (unicité), §7 (FAQ), §9 (écriture), §9.3
(mini-simulateurs), §11 (titres), §21 (bloc citable). Éditeur : Radif Partners. Aucun lien vers un
installateur, un obligé CEE, une plateforme de mise en relation ni un autre site du portefeuille.

## Une page = un fichier

- Guide : `src/content/guides/<id>.ts` ; page outil : `src/content/outils/<id>.ts`, avec
  `tool: 'simulateur'` (simulateur complet, `preset` et `focus` pour l'ouvrir sur un cas) ou
  `tool: 'departements'` (tableau des 96 départements, `region` pour le filtrer).
- Page régionale : modèle `pompe-a-chaleur-hauts-de-france.ts` ; le tableau partagé est
  `tableRegion(h, codes)` dans `src/lib/region-pages.ts`.
- Le fichier porte les deux langues (`fr`, `en`) : slug, nav, card, title (50–60 car., terme-clé en tête),
  description (150–160 car.), h1, intro, `resume(h)` (un paragraphe ≥ 120 mots), `faqs(h)` (questions
  uniques sur tout le site, réponses de 40 à 90 mots), `body(h)`. L'`id` est le nom du fichier.
- Le cœur (routes, menus, sitemap, hreflang, schémas) lit ces fichiers seul : ne pas le modifier pour
  ajouter une page.

## Aucun chiffre en dur

Barèmes et prix changent : tout chiffre vient de `h.P` (params-2026.json), `h.M` (moteur : `simuler`,
`cee`, `plafondsRfr`, `puissanceFroid`…), `h.dep(code)` (climat d'un département). Dates de données :
`h.moisCee`, `h.dateElec`, `h.periodeGaz`. Une comparaison (« plus froid », « plus rentable ») est
calculée, jamais affirmée. Formats : `h.eur`, `h.num`, `h.pct`, `h.date`. Liens : `h.a(id, texte)`
(interne), `h.src(clé, texte)` (source officielle).

## Mini-simulateurs

`<!--mini:KIND-->` dans le corps et `mini: 'KIND'` dans la page. Disponibles (`src/lib/minis/`) :
ampleur, cee, conso, couleur, dju, economie, ecoptz, fioul, gaz, mpr, prixKw, puissance, retour, tva.

## Contrôles

`npm run check` (build, tests, typographie, légal, SEO, unicité, trame, liens, layout, sources,
simulateurs, hreflang, anglais, portefeuille, cookies, URL, premier écran), plus
`python3 scripts/check-regles.py .`, `node scripts/check-contraste.mjs .`,
`node scripts/check-saisie.mjs . --max=60`, `node scripts/check-nombres.mjs .`,
`python3 scripts/check-requetes.py .`.
