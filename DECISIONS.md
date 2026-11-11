# Journal des décisions

Chaque décision importante du projet, avec sa date, qui l'a prise et pourquoi. Le plus récent en haut.
Les documents de travail détaillés (maquettes, débat, références) sont dans le Projet Claude « les cabanes d'en haut ».

Légende : **Corantin** = décidé par Corantin ; **proposé** = proposé par Claude, validé ou non à la fusion de la pull request.

---

## 11 novembre 2026, après-midi : après le débat « praticité et immersion »

Retour de Corantin sur le prototype : Pyrénées pas assez réalistes, zoom pas assez immersif, vue depuis la cabane brouillonne,
recherche pas efficace en vue lointaine. Cinq points de vue ont débattu (débutante, randonneur passionné, accompagnatrice en
montagne, designer, ingénieur en cartographie 3D).

- **Corantin** : la carte du Bon Toit reste l'écran principal, retravaillée, avec tous ses outils actuels (liste, recherche, filtres,
  tri, me localiser, GPX, itinéraire, refuges.info). Rien ne se perd.
- **Corantin** : **2D pour chercher**, la **3D s'ouvre d'elle-même quand on ouvre une cabane**, et reste disponible par un bouton.
- **Corantin** : **vol court (environ 1 seconde)** vers la cabane, coupé automatiquement si l'appareil demande moins d'animations,
  avec un réglage « sans animation » dans Mon carnet.
- **Corantin** : un filtre **« première nuit »** (marche courte, facile, eau, bonne saison) qui affiche une sélection large,
  **sans classement**.
- **Corantin** : fond **topo par défaut** ; si on choisit IGN, le site s'en souvient ; bascule automatique côté Espagne.
- **Corantin** : plan en trois étapes. 1) La carte refaite, avec vol 3D et fiche en un écran. 2) La vue depuis la cabane
  (panorama 360°, soleil, date, sommets nommés, précision, mini-carte). 3) Grande ouverture animée, neige estimée, hors ligne.
  Ensuite : pages calmes restylées (Coin du feu, Participer, Mon carnet), comptes, « première nuit », comparaison, tracé.
- **Corantin** : on travaille désormais **dans le vrai site**, sur des branches, avec l'aperçu Cloudflare de chaque pull request.
  Les maquettes séparées s'arrêtent (elles ne peuvent pas charger les vraies cartes, donc le relief y était forcément faux).
- **Corantin** : les données manquantes (états, dénivelés, durées…) ne bloquent rien ; il mettra les fiches à jour à la main
  avant la publication finale.
- Règle maintenue : toute donnée d'exemple affichée est marquée « exemple ».
- Vigilance (accompagnatrice) : un tracé dessiné à la main sur le relief reste personnel, marqué « non vérifié », jamais présenté
  comme un itinéraire ; le vol vers la cabane montre aussi le sentier et le dénivelé ; la neige est affichée comme une estimation.
- **Proposé** : la carte 2D reste sur Leaflet (déjà dans la page, instantanée), et la 3D utilise MapLibre **hébergé sur le site**
  et **chargé à la demande** (plus de dépendance au CDN unpkg). Raison : la règle « autonomie de la page » de `CLAUDE.md`
  interdit de charger une grosse bibliothèque au démarrage ; la 2D par défaut rend ce découpage naturel.

## 11 novembre 2026, matin : prototype interactif

- **Corantin** : on va plus loin dans le détail (relief juste, placement exact des cabanes, typographie, météo), sans en faire trop :
  « la bonne dose ».
- **Corantin** : une fiche tient **en un écran**, sur téléphone comme sur ordinateur.
- **Corantin** : le but premier reste le choix des cabanes et le tracé. Idées retenues pour plus tard : tracé ou plan en 3D,
  « montage 3D » de la cabane.
- **Corantin** : on ne perd aucune idée émise ; chaque chose en son temps (liste « Idées en réserve » dans le dossier de passation).

## Novembre 2026, premières séances : nom et direction créative

- **Corantin** : le site s'appelle **« les cabanes d'en haut »** (« Le Bon Toit » est déjà utilisé par un autre site).
  Le renommage du code et des textes du site se fera dans une pull request à part. Les clés de stockage du carnet ne changent pas
  (sinon les carnets existants ne se chargeraient plus).
- **Corantin** : direction créative **B** (la nuit, la ligne d'horizon), enrichie de A (élégance, mode jour) et de C.
  Le tracé rouge et blanc de C est écarté : il fait croire à un sentier balisé.
- **Corantin** : le ciel suit **l'heure réelle**, la même partout (la nuit étoilée à 21 h, le matin à 9 h) ; lever et coucher du
  soleil propres à chaque cabane, selon son orientation et le relief qui la masque.
- **Corantin** : sans réseau, la météo n'est pas affichée ; un fond différent signale qu'on est hors ligne.
- Photos et vidéos : Corantin les enverra plus tard.

## Règles permanentes

- Rien ne part en ligne sans que Corantin fusionne lui-même la pull request.
- Les règles de `CLAUDE.md` (vie privée, contenus d'autrui, esprit du site, modération, autonomie, accessibilité, compatibilité
  des carnets) s'appliquent à tout.
