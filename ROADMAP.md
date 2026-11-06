# Le Bon Toit : plan de la v2

Le plan tient en une idée : **Le Bon Toit devient l'endroit où l'on sait dans quel état est une cabane, aujourd'hui.**
Les autres sites listent des abris ; aucun ne te dit de façon fiable s'il reste du bois, si la source coule, si la porte ferme.
Tout le reste (comptes, médailles, sorties, carnet) sert cette promesse ou fait revenir les gens pour l'alimenter.

## 1. Mettre en ligne sans payer

**Choix recommandé : GitHub pour le code, Cloudflare Pages pour l'hébergement.**

| | Cloudflare Pages (recommandé) | GitHub Pages (plan B) |
|---|---|---|
| Adresse | `lebontoit.pages.dev` (si le nom est libre) | `lebontoit.github.io` (via une organisation GitHub gratuite « lebontoit ») |
| Coût | 0 € | 0 € |
| Bande passante | pas de limite affichée pour un site statique | limite souple d'environ 100 Go par mois |
| Mises en ligne | 500 par mois, automatiques à chaque fusion | automatiques |
| Aperçu de chaque modification avant publication | **oui**, une adresse par pull request | non |
| Comptes à créer | GitHub + Cloudflare | GitHub seul |

L'aperçu par pull request fait la différence : chaque modification d'un agent a sa propre adresse de test, que tu ouvres sur ton
téléphone avant d'accepter. Cloudflare met désormais en avant « Workers » pour les nouveaux projets, mais Pages fonctionne toujours et
reste le plus simple pour un site statique ; passer à Workers plus tard prend dix minutes.

Plus tard, si tu veux une vraie adresse : `lebontoit.fr` coûte quelques euros par an et se branche sur Cloudflare en cinq minutes.
Les mentions légales ont été mises à jour avec l'hébergeur Cloudflare, Inc. Pour les contributions, crée une adresse e-mail dédiée
au site plutôt que d'afficher ta boîte perso.

## 2. Des agents qui codent le site en direct

Le dépôt est prêt pour ça : `CLAUDE.md` explique le projet et ses règles aux agents, `tests/verifier.py` contrôle le site dans un
vrai navigateur (bureau et mobile) et refuse toute modification qui casse quelque chose.

Le circuit d'une modification :

1. Tu décris ce que tu veux (une phrase suffit).
2. Un agent Claude crée une branche, code, lance la vérification, ouvre une pull request.
3. GitHub relance la vérification ; Cloudflare publie un aperçu.
4. Tu regardes l'aperçu ; tu fusionnes ou tu demandes une retouche en commentaire.
5. Le site est en ligne une à deux minutes après la fusion.

Trois façons de donner du travail aux agents :

- **Claude Code dans le cloud** (claude.ai/code, ou l'appli mobile) : tu choisis le dépôt, tu décris la tâche. Plusieurs tâches
  peuvent tourner en parallèle sur le même dépôt, chacune donne sa pull request. C'est la voie principale : elle passe par ton
  abonnement, sans frais en plus.
- **« @claude » dans un ticket GitHub** : tu ouvres un ticket « @claude ajoute un filtre Accessible en raquettes », l'agent répond
  par une pull request. Pratique pour tenir une liste d'idées. Il faut une fois générer un jeton lié à ton abonnement
  (`claude setup-token`, sur un ordinateur) et le ranger dans les secrets du dépôt sous le nom `CLAUDE_CODE_OAUTH_TOKEN`.
- **Moi, dans cette conversation**, dès que GitHub est connecté : je pousse directement des branches et des pull requests.

Mettre à jour les cabanes ne demande pas d'agent : dans ton carnet, « Préparer la version en ligne », puis dépose le fichier dans le
dossier `depot/` sur GitHub. Une action extrait cabanes et photos et republie le site.

Garde-fou à activer sur GitHub : protéger la branche `main` (fusion seulement par pull request, vérification obligatoire).

## 3. Les comptes et ce que chacun peut faire

**Technique : Supabase**, offre gratuite : 50 000 utilisateurs actifs par mois, base de 500 Mo, 1 Go de photos, 5 Go de transfert
par mois, serveurs en Europe. Connexion par lien magique envoyé par e-mail (pas de mot de passe à retenir) ou par Google.
Deux contraintes à connaître :

- un projet gratuit **se met en pause après une semaine sans activité** : une petite action GitHub quotidienne le garde éveillé ;
- l'envoi d'e-mails intégré est très limité : on branche un service d'envoi gratuit (Brevo ou Resend) pour les liens de connexion.

Les photos sont réduites dans le téléphone avant l'envoi (environ 200 Ko). Une fois validées, elles peuvent être recopiées sur le
site statique, où la bande passante est gratuite, pour ne pas épuiser les 5 Go de Supabase.

### Qui peut faire quoi

| Action | Visiteur | Inscrit | Contributeur de confiance | Toi (modérateur) |
|---|---|---|---|---|
| Carte, fiches, météo, 3D, guide, culture | oui | oui | oui | oui |
| Signaler l'état d'une cabane | oui, modéré | oui, modéré | **publié tout de suite** | oui |
| Avis + « je recommande », photos | non | oui, modéré | oui, modéré | oui |
| Mon carnet (faites, à faire, sorties, notes privées) synchronisé | sur cet appareil | **sur tous ses appareils** | oui | oui |
| Suivre une cabane (alerte au nouvel état) | non | oui | oui | oui |
| Proposer une cabane, une correction, un texte | oui, modéré | oui, modéré | oui, modéré | oui |
| Médailles et titre | sur l'honneur, local | calculées sur ses contributions validées | oui | oui |
| Sorties partagées | lire | publier, répondre (majeurs) | oui | oui |
| File de modération, retirer un contenu, bannir | non | non | non | oui |

« Contributeur de confiance » : après une dizaine de contributions validées, ses signalements d'état passent sans attente.
C'est ce qui garde la carte fraîche sans t'épuiser à modérer.

### Ce qui en fait un site qu'on garde

1. **L'état en direct.** Sur chaque fiche : bois, eau, propreté, porte, couchage, neige, avec la date et le nombre de témoignages.
   Un signalement prend 15 secondes au retour de rando. Les vieux états pâlissent avec le temps.
2. **Le carnet personnel pour tous.** Ton outil de départ devient celui de chaque inscrit : cabanes faites et à faire, carte perso,
   statistiques (nuits, dénivelé, massifs), export GPX. C'est la raison de créer un compte.
3. **Les médailles qui comptent.** Calculées à partir de contributions vérifiées, plus seulement déclarées. Les défis gardent leur
   avertissement de sécurité.
4. **Les sorties partagées, avec des règles.** Annonce « Niscoude, week-end du 12 février, départ Toulouse, deux places ».
   Entre particuliers, sans guide payant, réservé aux majeurs ; on clique « Je suis intéressé », les coordonnées ne s'échangent
   qu'après accord de l'auteur ; rappel de prévenir un proche. **Pas de messagerie privée libre** : c'est le premier nid à abus et
   le plus lourd à modérer ; l'échange de coordonnées après accord suffit.
5. **Des alertes utiles.** Suivre une cabane : un e-mail (ou une notification) quand son état change. Résumé hebdomadaire facultatif.
6. **Le site dans la poche.** Installable sur l'écran d'accueil ; fiches et derniers états consultables sans réseau. Le fond de carte
   hors ligne demande une étude à part : les serveurs de tuiles OpenStreetMap interdisent le téléchargement en masse.
7. **Une page par cabane.** Le site génère `/cabane/lhurs` avec titre, photo et description propres : Google les trouve, et un
   lien partagé sur WhatsApp affiche une jolie vignette. Aujourd'hui, le site est invisible des moteurs de recherche.
8. **Protéger les lieux fragiles.** Pour une cabane que tu juges sensible, la position exacte n'est montrée qu'aux inscrits
   contributeurs ; les autres voient une zone. Fidèle à l'esprit anti-surfréquentation du site.

### Données (Supabase, sécurité ligne par ligne)

`profils` (pseudo, titre, rôle, date d'inscription) · `cabanes` · `etats` (signalements datés) · `avis` (note, recommande, texte)
· `photos` · `visites` (carnet personnel, **privé**) · `favoris` et `suivis` · `sorties` et `participations` · `textes_culture`
· `medailles` · `moderation` (file d'attente, décisions) · `signalements_abus`.
Règle générale : chacun lit ce qui est publié et écrit seulement ses propres lignes ; seul le rôle modérateur publie ou retire.

### Le cadre légal, dès l'ouverture des comptes

- Politique de confidentialité et conditions d'utilisation, en clair.
- Âge minimum de 15 ans pour créer un compte, 18 ans pour les sorties partagées.
- Supprimer son compte et télécharger ses données en un clic.
- Bouton « Signaler ce contenu » sur chaque avis, photo et sortie, avec traitement rapide (le règlement européen DSA le demande
  aux hébergeurs de contenus).
- Pas de traceur, pas de publicité : donc pas de bandeau cookies (la session de connexion est strictement nécessaire).

## 4. Ce qui ne tiendra pas en grandissant, et ce qu'on change

- **Les contributions par e-mail et code « LBT1 ».** Bien pour démarrer, ingérable au-delà de quelques envois par semaine.
  Remplacé par une file de modération dans le site : un bouton Publier, un bouton Refuser.
- **Toutes les photos chargées au démarrage.** Le site deviendrait lourd avec quelques centaines de photos. On les chargera à la
  demande, à l'ouverture de la fiche.
- **Un site invisible pour Google** (une seule page, tout dans l'ancre `#`). Corrigé par les pages par cabane.

## 5. Les étapes

| Étape | Contenu | Ton temps |
|---|---|---|
| **0. En ligne** (cette semaine) | Dépôt GitHub, Cloudflare Pages, adresse de contact dédiée : v1.3 en ligne | environ 1 h |
| **1. v1.4, finitions** | Logo choisi intégré, site installable sur le téléphone, une page par cabane, photos chargées à la demande | relire les aperçus |
| **2. v2.0, comptes** | Supabase : connexion, profil, avis, états et photos directs, file de modération, carnet synchronisé, médailles calculées, pages légales | créer le projet Supabase (15 min) |
| **3. v2.1, communauté** | Contributeurs de confiance, suivre une cabane, sorties partagées | relire, modérer |
| **4. v2.2, terrain** | Fiches hors ligne, cabanes sensibles, statistiques du carnet | relire |

## 6. À faire de ton côté

1. Connecter GitHub à Claude (Réglages > Connecteurs > GitHub).
2. Créer un compte Cloudflare, puis Workers & Pages > Créer > Pages > Connecter à Git > dépôt `le-bon-toit`.
   Réglages de construction : commande `python3 build.py`, dossier de sortie `dist`.
3. Créer une adresse e-mail dédiée au site et la mettre dans `data/site.json`.
4. Pour l'étape 2 : créer un projet Supabase (région Europe) et me donner son adresse et sa clé publique (« anon »).
5. Facultatif : acheter `lebontoit.fr`.
