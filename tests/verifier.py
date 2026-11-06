#!/usr/bin/env python3
"""Vérification automatique du site construit (dist/). À lancer après chaque modification :

    python3 build.py && python3 tests/verifier.py

Ouvre le site dans un vrai navigateur (Playwright + Chromium), sans réseau extérieur
(fonds de carte, météo et refuges.info sont bloqués), et échoue s'il y a la moindre erreur.
Les captures d'écran vont dans tests/captures/ pour vérifier l'apparence à l'œil.
"""
import asyncio, functools, http.server, json, pathlib, sys, threading
from playwright.async_api import async_playwright

RACINE = pathlib.Path(__file__).resolve().parent.parent
DIST, CAPT = RACINE / "dist", RACINE / "tests/captures"
PAGES = ["carte", "classement", "culture", "guide", "participer", "profil", "apropos"]
echecs = []


def ok(cond, msg):
    print(("  ok   " if cond else "  ÉCHEC ") + msg)
    if not cond:
        echecs.append(msg)


def serveur():
    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Muet, directory=str(DIST)))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{s.server_port}/"


async def bloquer_exterieur(ctx, base):
    async def h(route):
        u = route.request.url
        await (route.continue_() if u.startswith((base, "data:", "blob:")) else route.abort())
    await ctx.route("**/*", h)


def donnees_publiees():
    p = RACINE / "data/publie.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"cabanes": [], "photos": []}


def verifier_confidentialite(d):
    print("Confidentialité des données publiées")
    avec = [c["nom"] for c in d["cabanes"] for v in c.get("visites", []) if v.get("avec")]
    ok(not avec, "aucun « avec qui » publié" + (f" (trouvé : {avec[:3]})" if avec else ""))
    ok(not any(c.get("exemple") for c in d["cabanes"]), "aucune fiche d'exemple publiée")
    ok(not any("envie" in c for c in d["cabanes"]), "aucune « envie » publiée")


async def main():
    if not (DIST / "index.html").exists():
        sys.exit("Lance d'abord : python3 build.py")
    CAPT.mkdir(parents=True, exist_ok=True)
    d = donnees_publiees()
    verifier_confidentialite(d)
    base = serveur()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for nom, vue in [("bureau", {"width": 1360, "height": 860}), ("mobile", {"width": 390, "height": 844})]:
            print(f"Site public · {nom}")
            ctx = await b.new_context(viewport=vue, is_mobile=nom == "mobile", has_touch=nom == "mobile")
            await bloquer_exterieur(ctx, base)
            pg, errs = await ctx.new_page(), []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(base + "index.html")
            await pg.wait_for_timeout(1500)
            if await pg.is_visible("#modalBienvenue"):
                await pg.click("[data-bv=ok]")
            ok(await pg.evaluate("document.body.classList.contains('partage')"), "mode public actif")
            n = await pg.evaluate("document.querySelectorAll('#list .card').length")
            ok(n == len(d["cabanes"]) or (n > 0 and len(d["cabanes"]) > 0), f"liste des cabanes affichée ({n} / {len(d['cabanes'])})")
            for page in PAGES:
                await pg.evaluate(f"location.hash = '#{page}'")
                await pg.wait_for_timeout(250)
                vis = await pg.evaluate("[...document.querySelectorAll('.page')].filter(x => !x.hidden).map(x => x.id)")
                ok(len(vis) == 1, f"page {page} affichée")
                large = await pg.evaluate("document.documentElement.scrollWidth > innerWidth + 1")
                ok(not large, f"page {page} sans défilement horizontal")
                await pg.screenshot(path=str(CAPT / f"{nom}-{page}.png"))
            if d["cabanes"]:
                await pg.evaluate(f"location.hash = '#c={d['cabanes'][0]['id']}'")
                await pg.wait_for_timeout(600)
                ok(await pg.is_visible("#detail h3"), "une fiche de cabane s'ouvre par son lien")
                await pg.screenshot(path=str(CAPT / f"{nom}-fiche.png"))
            if d.get("photos"):
                await pg.wait_for_timeout(500)
                nb = await pg.evaluate("document.querySelectorAll('#detHero img, #list .card img').length")
                ok(nb > 0, f"photos chargées depuis dist/photos ({nb} visibles)")
            ok(not errs, "aucune erreur JavaScript" + (f" : {errs[:3]}" if errs else ""))
            await ctx.close()
        print("Carnet personnel vierge")
        ctx = await b.new_context()
        await bloquer_exterieur(ctx, base)
        pg, errs = await ctx.new_page(), []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(base + "carnet.html")
        await pg.wait_for_timeout(1200)
        ok(not await pg.evaluate("document.body.classList.contains('partage')"), "mode carnet actif")
        ok(not errs, "aucune erreur JavaScript" + (f" : {errs[:3]}" if errs else ""))
        await b.close()
    print()
    if echecs:
        sys.exit(f"{len(echecs)} vérification(s) en échec.")
    print("Tout est bon. Captures : tests/captures/")


if __name__ == "__main__":
    asyncio.run(main())
