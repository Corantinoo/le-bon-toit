#!/usr/bin/env python3
"""Met à jour les données du site à partir d'un index.html créé par le carnet.

Dans ton carnet : Données > « Préparer la version en ligne » crée un index.html.
Dépose-le dans le dossier depot/ du dépôt (sur GitHub : Add file > Upload files) :
une action GitHub lance ce script, met à jour data/ et republie le site.

À la main :  python3 tools/importer_publication.py depot/index.html
"""
import base64, json, pathlib, re, sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}


def main(chemin: str):
    html = pathlib.Path(chemin).read_text(encoding="utf-8")
    m = re.search(r'<script type="application/json" id="donneesPartagees">([\s\S]*?)</script>', html)
    if not m or not m.group(1).strip():
        sys.exit("Ce fichier ne contient pas de données publiées (as-tu bien utilisé « Préparer la version en ligne » ?).")
    d = json.loads(m.group(1))
    if not isinstance(d.get("cabanes"), list):
        sys.exit("Données illisibles : pas de liste de cabanes.")
    dossier = RACINE / "data/photos"
    dossier.mkdir(parents=True, exist_ok=True)
    gardees = set()
    for p in d.get("photos", []):
        if not p.get("data"):
            if p.get("url"):
                gardees.add(pathlib.Path(p["url"]).name)
            continue
        entete, b64 = p["data"].split(",", 1)
        mime = re.match(r"data:([^;]+)", entete).group(1)
        nom = re.sub(r"[^A-Za-z0-9_-]", "_", str(p["id"])) + "." + EXT.get(mime, "jpg")
        (dossier / nom).write_bytes(base64.b64decode(b64))
        del p["data"]
        p["url"] = "photos/" + nom
        gardees.add(nom)
    for f in dossier.iterdir():   # photos retirées du carnet : retirées du site
        if f.name not in gardees and not f.name.startswith("."):
            f.unlink()
    d.pop("site", None)   # les coordonnées du site vivent dans data/site.json
    (RACINE / "data/publie.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(d['cabanes'])} cabanes, {len(d.get('photos', []))} photos, {len(d.get('culture') or [])} textes ajoutés")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
