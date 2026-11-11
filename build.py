#!/usr/bin/env python3
"""Construit le site Le Bon Toit.

    python3 build.py            -> dist/index.html (site public, avec les données de data/)
    python3 build.py --vide     -> dist/carnet.html seul (carnet personnel vierge, sans données)

Le site est une seule page HTML autonome : styles, icônes, Leaflet et code y sont intégrés.
Les photos publiées sont copiées à côté, dans dist/photos/.
"""
import json, pathlib, shutil, sys

RACINE = pathlib.Path(__file__).resolve().parent
lire = lambda p: (RACINE / p).read_text(encoding="utf-8")


def page(donnees_json: str = "") -> str:
    app = lire("src/js/app.js").replace("/*@@CULTURE@@*/", lire("src/js/culture.js").rstrip("\n"), 1)
    return "".join([
        lire("src/tete.html"),
        '<style id="vendor">\n', lire("vendor/polices-et-leaflet.css"), "</style>",
        "\n",
        "<style>\n", lire("src/styles.css"), "</style>\n",
        "\n</head>\n<body>\n", lire("src/icones.html"), lire("src/page.html"),
        '<script type="application/json" id="donneesPartagees">', donnees_json, "</script>\n",
        "<script>", lire("vendor/leaflet.js"), "\n</script>\n",
        "<script>\n", app, "</script>\n</body>\n</html>\n",
    ])


def donnees() -> str:
    pub = RACINE / "data/publie.json"
    if not pub.exists():
        return ""
    d = json.loads(pub.read_text(encoding="utf-8"))
    site = RACINE / "data/site.json"
    if site.exists():   # coordonnées et liens du site : data/site.json a le dernier mot
        s = {k: v for k, v in json.loads(site.read_text(encoding="utf-8")).items() if not k.startswith("_")}
        d["site"] = {**(d.get("site") or {}), **s}
        if s.get("auteur"):
            d["par"] = s["auteur"]
    return json.dumps(d, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def main():
    dist = RACINE / "dist"
    if dist.exists():
        shutil.rmtree(dist)
    dist.mkdir()
    (dist / "carnet.html").write_text(page(""), encoding="utf-8")
    if "--vide" in sys.argv:
        print("dist/carnet.html")
        return
    (dist / "index.html").write_text(page(donnees()), encoding="utf-8")
    photos = RACINE / "data/photos"
    if photos.exists():
        shutil.copytree(photos, dist / "photos")
    # MapLibre (relief en 3D) est servi à côté de la page et chargé seulement quand on passe en 3D
    shutil.copytree(RACINE / "vendor/maplibre", dist / "vendor/maplibre")
    for f in ("_headers", "robots.txt"):
        if (RACINE / "public" / f).exists():
            shutil.copy(RACINE / "public" / f, dist / f)
    taille = (dist / "index.html").stat().st_size
    print(f"dist/index.html : {taille/1024:.0f} Ko")


if __name__ == "__main__":
    main()
