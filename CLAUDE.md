# Le Bon Toit : consignes pour les agents

Site communautaire des cabanes et refuges des Pyrénées qui « valent la montée », créé par Corantin (pseudo : Corantinoo).
Le site est en français et tutoie le lecteur. Tout texte visible, commentaire de code et message de commit s'écrit en français.

## Construire et vérifier (obligatoire avant toute PR)

```bash
python3 build.py              # → dist/index.html (site public) + dist/carnet.html (carnet vierge) + dist/photos/
python3 tests/verifier.py     # navigateur de test, bureau + mobile, échoue à la moindre erreur JS
```

Ne propose jamais une PR si `tests/verifier.py` échoue. Regarde les captures dans `tests/captures/` quand tu touches à l'apparence,
et décris dans la PR ce que tu as vérifié. Si tu ajoutes une fonction, ajoute sa vérification dans `tests/verifier.py`.

## Organisation

Le site est **une seule page HTML autonome**, assemblée par `build.py` dans cet ordre :

| Fichier | Contenu |
|---|---|
| `src/tete.html` | `<head>` : titre, méta, favicon |
| `vendor/polices-et-leaflet.css` | polices Fraunces et Nunito Sans intégrées (OFL) + CSS Leaflet. Ne pas modifier |
| `src/styles.css` | tout le style (thème « Carnet d'estive », variables en haut du fichier, thème sombre) |
| `src/icones.html` | les icônes SVG (`<symbol id="i-…">`), utilisées par `<svg><use href="#i-…"/></svg>` |
| `src/page.html` | la structure : menu (`#tabs`), en-tête, pages (`#pageCarte`, `#pageClassement`…), fenêtres modales |
| `vendor/leaflet.js` | Leaflet 1.9.4. Ne pas modifier |
| `vendor/maplibre/` | MapLibre GL 5.24.1 (licence BSD). Copié tel quel dans `dist/vendor/maplibre/`, chargé seulement au passage en 3D. Ne pas modifier |
| `src/js/app.js` | toute l'application (JS sans dépendance, dans une IIFE en mode strict) |
| `src/js/culture.js` | les textes du coin culture, insérés dans app.js à la place de `/*@@CULTURE@@*/` |
| `data/publie.json` | les cabanes publiées (produit par `tools/importer_publication.py`, ne pas éditer à la main) |
| `data/site.json` | auteur, adresse de contact, formulaire, réseaux sociaux (modifiable) |
| `data/photos/` | photos publiées, servies à côté de la page |
| `public/` | fichiers copiés tels quels dans dist/ (`_headers` Cloudflare, `robots.txt`) |

Deux modes dans le même code : **carnet** (outil perso de Corantin, données en localStorage + IndexedDB)
et **public** (`modePartage`, `body.partage`, données lues dans `<script id="donneesPartagees">`). `P(perso, pub)` choisit le libellé.
Navigation par l'ancre : `#carte`, `#classement`, `#culture`, `#guide`, `#participer`, `#profil`, `#apropos`, `#c=<id de cabane>`.

Repères dans `app.js` : `SITE` (configuration), `rendreDetail` (fiche), `rendreClassement`, `rendreCulture`, `rendreInfoJour`,
`PART`/`envoyerPart` (Participer), `lireCode` (« À relire », codes `LBT1:…:LBT`), `MEDAILLES`/`rendreProfil`, `rendreGuide`,
`rendreApropos`, `entrer3D`/`quitter3D` (relief en 3D posé sur la carte, MapLibre chargé à la demande), `demarrer`.

## Règles à ne jamais casser

1. **Vie privée.** Le « avec qui » d'une sortie n'est jamais publié. Les notes privées ne le sont pas par défaut. Pas de traceur, pas de
   publicité, pas d'outil d'analyse qui dépose des cookies. Toute nouvelle donnée personnelle doit être justifiée dans la PR.
2. **Contenus d'autrui.** On peut faire un lien vers refuges.info ou pyrenees-refuges.com, jamais copier leurs textes ou leurs photos.
   La couche « Autres abris » interroge l'API refuges.info en direct et renvoie vers leurs fiches.
3. **Esprit du site.** Partager des cabanes avec soin, pas créer du tourisme de masse. Pas d'« assistant de sortie », pas de
   gamification qui pousse à prendre des risques : les défis gardent leur avertissement. La future recherche de partenaires
   (« Sorties partagées ») aura ses règles de sécurité : entre particuliers, sans guide payant, réservée aux majeurs,
   coordonnées révélées seulement après accord, prévenir un proche.
4. **Modération.** Rien d'écrit par un visiteur (avis, photo, signalement, texte) n'apparaît sans validation de Corantin.
5. **Autonomie de la page.** Pas de nouvelle dépendance chargée depuis un CDN au démarrage ; ce qui est lourd se charge à la demande
   (comme MapLibre pour la 3D, servi depuis le site, unpkg seulement en secours pour le carnet ouvert depuis un fichier). Pas de framework, pas d'étape de compilation JS.
6. **Accessibilité et mobile.** Tout doit marcher à 390 px de large, au clavier, et en thème sombre. Contraste lisible.
7. **Compatibilité des données.** Les carnets existants (localStorage `carnet-cabanes-v1`, IndexedDB) doivent toujours se charger :
   toute évolution du format passe par `migrer()`.

## Style

Direction « Carnet d'estive » : vert forêt `--forest #23392D`, ocre `--or #B5751F`, papier `--bg #F4EDDF`. Titres en Fraunces,
texte en Nunito Sans. Ton chaleureux, phrases simples, sans jargon. Pas d'emoji dans l'interface (les icônes sont en SVG).
Utilise les variables CSS existantes plutôt que des couleurs en dur.

## Manière de travailler

- Une PR = un sujet. Titre clair en français, description : ce qui change pour le visiteur, ce que tu as vérifié.
- Ne modifie pas `data/publie.json` ni `data/photos/` sauf demande explicite : ce sont les données de Corantin.
- Ne pousse jamais directement sur `main`. Corantin relit l'aperçu Cloudflare de la PR puis fusionne.
- Si la demande est floue ou touche aux règles ci-dessus, pose la question dans le ticket au lieu de deviner.
- La feuille de route est dans `ROADMAP.md`.
