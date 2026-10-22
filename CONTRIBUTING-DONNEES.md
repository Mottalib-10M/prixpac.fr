# Données de Calcul PAC (fr-pompe-a-chaleur)

Aucun chiffre n'est écrit à la main dans une page : tout vient de `src/data/params-2026.json` (barèmes,
prix, hypothèses, chacun avec sa clé de source dans `sources`) et de `src/data/pac/departements.json`
(climat). Le moteur est `src/lib/engine/pac.ts`, rejoué par `src/lib/engine/pac.test.ts`.

## Sources et licences

| Donnée | Source | Licence / statut | Mise à jour |
|---|---|---|---|
| Degrés-jours (base 18 °C, 2015-2024 et 2025), froid typique par station | Météo-France, données climatologiques de base quotidiennes (data.gouv.fr) | Licence Ouverte 2.0 | manuelle, une fois par an (`scripts/data/dju.py`, `tbase.py`, `build-deps.py`) |
| Départements, régions, chefs-lieux | API Découpage administratif (geo.api.gouv.fr) | Licence Ouverte 2.0 | avec le climat |
| Zones H1/H2/H3 | Arrêté du 26 octobre 2010 (Légifrance) | texte officiel | à la main si l'arrêté change |
| Forfaits MaPrimeRénov', plafonds de revenus | Service-Public F35083 ; décret 2020-26 (écrêtement) | texte officiel | à la main (vérifier chaque 1er janvier et à chaque annonce Anah) |
| Fiches CEE BAR-TH-171/172, Coup de pouce | Arrêtés publiés (AIDA Ineris) | texte officiel | à la main |
| Prix moyens CEE (classique, précarité) | Registre Emmy, export CSV mensuel | données publiques du teneur de registre, citées | **automatique** |
| Électricité, tarif réglementé Base 9 kVA | CRE, open data (data.gouv.fr) | Licence Ouverte 2.0 | **automatique** |
| Gaz, prix moyen des ménages (20-199 GJ, TTC) | Eurostat `nrg_pc_202` | réutilisation libre, source citée | **automatique** |
| Fioul de chauffage, France, TTC | Commission européenne, Weekly Oil Bulletin | réutilisation libre, source citée | **automatique** |
| Rendement saisonnier (SCOP) mesuré | ADEME, avis sur les performances réelles des PAC | citée | à la main |
| Prix d'installation | Observatoire des devis de PAC 2026 (data.gouv.fr) | CC BY 4.0 | à la main |

## Le script automatique

```
node scripts/update-data.mjs                 # relève Emmy, CRE, Eurostat et le WOB, réécrit params-2026.json
node scripts/update-data.mjs --dry           # affiche sans écrire
node scripts/update-data.mjs --wob f.xlsx    # rejoue un classeur WOB local
```

- Chaque valeur est contrôlée (plage plausible) ; une source en panne garde la valeur de la veille et le
  script l'écrit en clair (`✗ …`). Il sort en erreur seulement si les quatre sources échouent.
- Le serveur d'Emmy n'envoie pas son certificat intermédiaire : le script retombe sur `curl` quand `fetch`
  refuse la connexion.
- Il écrit aussi `src/data/pac/fichier.json` (date du relevé, affichée « données relues le … »).
- Les dates affichées dans les textes (mois du prix CEE, date du tarif, semestre du gaz) suivent le fichier
  via `h.moisCee`, `h.dateElec`, `h.periodeGaz` : rien à réécrire dans les pages.

## Mise à jour automatique

`.github/workflows/deploy.yml` : chaque jour à 05:40 UTC, relevé, `vitest`, build, recommit de
`params-2026.json` et `fichier.json`, publication GitHub Pages, ping IndexNow. Un test raté bloque la
publication.

## Hypothèses (affichées comme telles sur le site)

Fioul à 10 kWh par litre ; coefficients G d'isolation (1,6 / 1,1 / 0,75 / 0,5 W/m³·K) ; hauteur sous
plafond 2,5 m ; 19 °C intérieur ; rendement de chaudière 86 % ; SCOP air/air 2,9 faute de mesure publique ;
prime CEE de l'air/air (BAR-TH-129) non chiffrée ; prix de la géothermie au plafond de dépense ; « froid
typique » = moyenne du minimum annuel sur 3 jours, pas la température de base réglementaire ; mesures du
PLF 2027 présentées comme un projet non voté.
