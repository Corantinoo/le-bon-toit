# Le Bon Toit

Les cabanes et refuges des Pyrénées qui valent vraiment la montée : carte, filtres précis, état constaté, météo à la cabane,
coin culture, guide du débutant. Un site communautaire créé par Corantinoo.

## Mise en ligne (une seule fois)

1. **Cloudflare** : le site est un projet *Workers* nommé `lebontoit`, relié à ce dépôt (réglages dans `wrangler.jsonc`).
   - Commande de construction : `python3 build.py`
   - Commande de déploiement : `npx wrangler deploy` (branche `main`)
   - Commande des aperçus : `npx wrangler preview` (autres branches)
   - Adresse publique : https://lebontoit.corantin-drm.workers.dev (Cloudflare > `lebontoit` > *Settings* > *Domains & Routes*).
   - Aperçu d'une pull request : `https://<nom-de-branche>-lebontoit.corantin-drm.workers.dev`, donné en commentaire par Cloudflare.
2. **Coordonnées** : mets l'adresse e-mail du site dans `data/site.json` (c'est là qu'arrivent avis, photos et signalements).
3. **Protection** : sur GitHub, *Settings* > *Branches* > ajoute une règle pour `main` : fusion par pull request seulement,
   vérification « Vérifier le site » obligatoire.

Chaque fusion dans `main` republie le site. Chaque pull request reçoit une adresse d'aperçu.

## Mettre à jour les cabanes

Dans ton carnet : *Données* > *Préparer la version en ligne*, puis dépose l'`index.html` obtenu dans le dossier `depot/`
(sur GitHub : *Add file* > *Upload files*). Le site se met à jour tout seul en une ou deux minutes.

## Faire évoluer le site avec Claude

- **claude.ai/code** (ou l'appli mobile) : choisis ce dépôt et décris ce que tu veux. Claude ouvre une pull request ;
  tu regardes l'aperçu et tu fusionnes.
- **Un ticket GitHub contenant « @claude »** : nécessite le secret `CLAUDE_CODE_OAUTH_TOKEN`
  (à générer une fois avec `claude setup-token` sur un ordinateur où Claude Code est installé).

Les consignes pour les agents sont dans [`CLAUDE.md`](CLAUDE.md), la feuille de route dans [`ROADMAP.md`](ROADMAP.md).

## Travailler en local

```bash
python3 build.py                              # construit dist/
pip install playwright && python3 -m playwright install chromium
python3 tests/verifier.py                     # vérifie le site dans un navigateur de test
```

`dist/carnet.html` est le carnet personnel vierge, à ouvrir directement dans un navigateur.

## Licences

Code : © Corantinoo. Leaflet (BSD-2-Clause). Polices Fraunces et Nunito Sans (SIL Open Font License 1.1).
Fonds de carte : © contributeurs OpenStreetMap, OpenTopoMap, IGN. Données « Autres abris » : refuges.info (liens vers leurs fiches).
