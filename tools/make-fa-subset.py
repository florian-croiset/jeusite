#!/usr/bin/env python3
"""
Génère le subset Font Awesome de la page d'accueil (icônes réellement utilisées).

Pourquoi : charger Font Awesome complet depuis le CDN = ~270 Ko de polices pour
une trentaine d'icônes. Ce script produit un woff2 minimal + un CSS local.

Le script est AUTONOME :
  - il scanne index.html + le JS chargé par la page pour lister les icônes `fa-*` ;
  - il télécharge les sources Font Awesome (CSS + woff2) ;
  - il classe chaque icône en solid/brands en lisant le vrai cmap des polices ;
  - il écrit assets/fonts/*.subset.woff2 et css/fontawesome-subset.css.

⚠️ À relancer si tu ajoutes une NOUVELLE icône `fa-*` sur index.html,
   sinon elle s'affichera en carré vide.

Prérequis : pip install fonttools brotli
Usage     : python tools/make-fa-subset.py
"""
import os
import re
import sys
import tempfile
import subprocess
import urllib.request

FA_VERSION = "6.5.0"
CDN = f"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/{FA_VERSION}"

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS_DIR = os.path.join(REPO, "assets", "fonts")
OUT_CSS = os.path.join(REPO, "css", "fontawesome-subset.css")

# Fichiers scannés pour trouver les icônes utilisées sur la page d'accueil :
# index.html + tous les scripts qu'elle charge (ui, utils, modales, tracking...).
SCAN = [
    "index.html",
    "js/ui", "js/utils", "js/config",
    "js/modal-advanced.js", "js/remote-refresh.js", "js/database.js",
    "js/discord-webhook.js", "js/discord-tracker.js", "js/ip-detection.js",
]

# Tokens `fa-*` qui ne sont PAS des icônes (styles, animations, tailles, variables).
NON_ICON = re.compile(
    r"^fa-(solid|regular|brands|light|thin|duotone|sharp|"
    r"beat|beat-fade|bounce|fade|flip|shake|spin|spin-pulse|spin-reverse|pulse|"
    r"fw|lg|sm|xs|[0-9]+x|border|pull-left|pull-right|inverse|stack|stack-1x|stack-2x|"
    r"li|rotate|rotate-90|rotate-180|rotate-270|flip-horizontal|flip-vertical|flip-both|"
    r"animation|animation-duration|animation-delay|animation-direction|"
    r"animation-iteration-count|animation-timing|beat-scale)$"
)


def log(*a):
    print(*a, file=sys.stderr)


def collect_icons():
    names = set()
    for rel in SCAN:
        path = os.path.join(REPO, rel)
        files = []
        if os.path.isdir(path):
            for root, _, fs in os.walk(path):
                files += [os.path.join(root, f) for f in fs
                          if f.endswith((".js", ".html", ".css"))]
        elif os.path.isfile(path):
            files = [path]
        for f in files:
            txt = open(f, encoding="utf-8", errors="ignore").read()
            for tok in re.findall(r"fa-[a-z0-9][a-z0-9-]*", txt):
                if not NON_ICON.match(tok):
                    names.add(tok[3:])  # retire le préfixe "fa-"
    return names


def download(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    log(f"  téléchargement {url}")
    # 1) urllib (portable). Peut échouer derrière un proxy d'inspection TLS.
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "make-fa-subset"})
        with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as out:
            out.write(r.read())
        return dest
    except Exception as e:
        log(f"  urllib échoué ({e.__class__.__name__}) — repli sur PowerShell…")
    # 2) Repli Windows : Invoke-WebRequest utilise le magasin de certificats de l'OS.
    if os.name == "nt":
        subprocess.run(
            ["powershell", "-NoProfile", "-Command",
             f"[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12;"
             f"Invoke-WebRequest '{url}' -OutFile '{dest}'"],
            check=True)
        return dest
    raise RuntimeError(f"Impossible de télécharger {url}")


def cmap_codepoints(font_path):
    from fontTools.ttLib import TTFont
    font = TTFont(font_path)
    cps = set()
    for table in font["cmap"].tables:
        cps.update(table.cmap.keys())
    return cps


def main():
    os.makedirs(FONTS_DIR, exist_ok=True)
    # Cache stable (évite de re-télécharger les sources FA à chaque exécution).
    work = os.path.join(tempfile.gettempdir(), f"fa-src-{FA_VERSION}")
    os.makedirs(work, exist_ok=True)

    css_src = download(f"{CDN}/css/all.min.css", os.path.join(work, "all.min.css"))
    solid_src = download(f"{CDN}/webfonts/fa-solid-900.woff2", os.path.join(work, "solid.woff2"))
    brands_src = download(f"{CDN}/webfonts/fa-brands-400.woff2", os.path.join(work, "brands.woff2"))

    css = open(css_src, encoding="utf-8").read()

    # Table complète nom -> codepoint (gère les sélecteurs groupés et les alias :
    #   .fa-a:before,.fa-b:before{content:"\fXXX"}  => a et b -> fXXX)
    name_to_cp = {}
    for m in re.finditer(r'([^{}]*?)\{content:"\\([0-9a-fA-F]+)"\}', css):
        selectors, cp = m.group(1), int(m.group(2), 16)
        for sm in re.finditer(r"\.fa-([a-z0-9-]+)::?before", selectors):
            name_to_cp.setdefault(sm.group(1), cp)

    used = collect_icons()
    solid_cps = cmap_codepoints(solid_src)
    brands_cps = cmap_codepoints(brands_src)

    solid_map, brands_map, missing = {}, {}, []
    for name in sorted(used):
        cp = name_to_cp.get(name)
        if cp is None:
            missing.append(name)
            continue
        if cp in brands_cps and cp not in solid_cps:
            brands_map[name] = cp          # icône de marque
        elif cp in solid_cps:
            solid_map[name] = cp           # icône solid
        else:
            missing.append(name)           # absente des polices gratuites (Pro/renommée)

    def subset(src, out, cps):
        if not cps:
            return
        unicodes = ",".join("U+%04x" % c for c in sorted(set(cps)))
        subprocess.run([sys.executable, "-m", "fontTools.subset", src,
                        "--unicodes=" + unicodes, "--flavor=woff2",
                        "--output-file=" + out, "--no-hinting", "--desubroutinize"],
                       check=True)

    solid_out = os.path.join(FONTS_DIR, "fa-solid-900.subset.woff2")
    brands_out = os.path.join(FONTS_DIR, "fa-brands-400.subset.woff2")
    subset(solid_src, solid_out, solid_map.values())
    subset(brands_src, brands_out, brands_map.values())

    # --- Génération du CSS local ---
    L = [
        f"/* Font Awesome {FA_VERSION} — SUBSET local (icônes utilisées sur index.html).",
        "   Généré par tools/make-fa-subset.py — NE PAS éditer à la main.",
        "   Relancer le script si tu ajoutes une nouvelle icône sur la page d'accueil. */",
        '@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;'
        'font-display:swap;src:url("../assets/fonts/fa-solid-900.subset.woff2") format("woff2")}',
    ]
    if brands_map:
        L.append('@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;'
                 'font-display:swap;src:url("../assets/fonts/fa-brands-400.subset.woff2") format("woff2")}')
    L.append('.fa,.fas,.fa-solid,.fab,.fa-brands{-moz-osx-font-smoothing:grayscale;'
             '-webkit-font-smoothing:antialiased;display:var(--fa-display,inline-block);'
             'font-style:normal;font-variant:normal;line-height:1;text-rendering:auto}')
    L.append('.fa,.fas,.fa-solid{font-family:"Font Awesome 6 Free";font-weight:900}')
    if brands_map:
        L.append('.fab,.fa-brands{font-family:"Font Awesome 6 Brands";font-weight:400}')
    for name, cp in {**solid_map, **brands_map}.items():
        L.append('.fa-%s:before{content:"\\%x"}' % (name, cp))
    # Animations conservées (utilisées sur la page : fusée = fa-beat ; boutons = fa-spin)
    L.append('.fa-beat{animation-name:fa-beat;animation-delay:var(--fa-animation-delay,0s);'
             'animation-direction:var(--fa-animation-direction,normal);'
             'animation-duration:var(--fa-animation-duration,1s);'
             'animation-iteration-count:var(--fa-animation-iteration-count,infinite);'
             'animation-timing-function:var(--fa-animation-timing,ease-in-out)}')
    L.append('@keyframes fa-beat{0%,90%{transform:scale(1)}45%{transform:scale(var(--fa-beat-scale,1.25))}}')
    L.append('.fa-spin{animation-name:fa-spin;animation-duration:var(--fa-animation-duration,2s);'
             'animation-iteration-count:var(--fa-animation-iteration-count,infinite);'
             'animation-timing-function:var(--fa-animation-timing,linear)}')
    L.append('@keyframes fa-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}')

    open(OUT_CSS, "w", encoding="utf-8").write("\n".join(L) + "\n")

    log(f"Icônes solid : {len(solid_map)} | brands : {len(brands_map)} {list(brands_map)}")
    log(f"Ignorées (Pro/renommées, jamais rendues de toute façon) : {missing}")
    for f in (solid_out, brands_out):
        if os.path.exists(f):
            log(f"  {os.path.relpath(f, REPO)} : {os.path.getsize(f)} o")
    log(f"  {os.path.relpath(OUT_CSS, REPO)} : {os.path.getsize(OUT_CSS)} o")


if __name__ == "__main__":
    main()
