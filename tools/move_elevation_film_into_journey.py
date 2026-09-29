from pathlib import Path


root = Path(__file__).resolve().parents[1]
bundle = root / "assets" / "index-zqRoXS94.js"
text = bundle.read_text(encoding="utf-8")
start_marker = 'S.jsxDEV("section",{id:"elevation-film"'
next_marker = 'S.jsxDEV(oT,{},void 0,!1,{fileName:"/home/user/alpha-city/packages/web/src/web/pages/index.tsx"'
if text.count(start_marker) != 1 or text.count(next_marker) != 1:
    raise RuntimeError("Could not identify the misplaced section and following gallery")
start = text.index(start_marker)
end = text.index(next_marker, start)
text = text[:start] + text[end:]
if text.count('href:"#elevations"') != 2:
    raise RuntimeError("Expected two Elevations navigation links")
text = text.replace('href:"#elevations"', 'href:"#elevation-film"')
bundle.write_text(text, encoding="utf-8")

html = root / "index.html"
text = html.read_text(encoding="utf-8")
for old, new in {
    'assets/index-zqRoXS94.js?v=13': 'assets/index-zqRoXS94.js?v=14',
    'assets/hero-sequence-player.js?v=28': 'assets/hero-sequence-player.js?v=29',
    'assets/sequence-journey.css?v=26': 'assets/sequence-journey.css?v=27',
}.items():
    if text.count(old) != 1:
        raise RuntimeError(f"Expected one {old}")
    text = text.replace(old, new)
for unused in (
    '    <script defer src="assets/elevation-film.js?v=1"></script>\n',
    '    <link rel="stylesheet" href="assets/elevation-film.css?v=1">\n',
):
    if text.count(unused) != 1:
        raise RuntimeError(f"Expected one {unused}")
    text = text.replace(unused, "")
html.write_text(text, encoding="utf-8")
print("Elevation frames now play in the opening scroll journey after the clubhouse sequence.")
