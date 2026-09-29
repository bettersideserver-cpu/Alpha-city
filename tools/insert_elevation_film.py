import json
from pathlib import Path


root = Path(__file__).resolve().parents[1]
bundle = root / "assets" / "index-zqRoXS94.js"
code = bundle.read_text(encoding="utf-8")

clubhouse = 'S.jsxDEV(lT,{},void 0,!1,{fileName:"/home/user/alpha-city/packages/web/src/web/pages/index.tsx",lineNumber:24,columnNumber:7},this),'
if code.count(clubhouse) != 1:
    raise RuntimeError("Could not find the clubhouse insertion point exactly once")

film_markup = (
    "<div class='elevation-film__stage'>"
    "<canvas id='elevation-film-canvas' role='img' aria-label='Architectural sequence of Elevation A and Elevation B'></canvas>"
    "<div class='elevation-film__veil' aria-hidden='true'></div>"
    "<div class='elevation-film__top'><span>ALPHA INTERNATIONAL CITY</span><span>THE RESIDENCES &nbsp; / &nbsp; 01 — 02</span></div>"
    "<div class='elevation-film__bottom'>"
    "<div class='elevation-film__story'><span class='elevation-film__eyebrow'>THE ELEVATIONS</span>"
    "<h2><span class='elevation-film__title-a'>Elevation A</span><span class='elevation-film__title-b'>Elevation B</span></h2>"
    "<p>Two distinct expressions of home.</p></div>"
    "<div class='elevation-film__progress'><span id='elevation-film-count'>001 / 144</span>"
    "<span class='elevation-film__progress-track' aria-hidden='true'><i></i></span>"
    "<span class='elevation-film__scroll'>SCROLL TO EXPLORE</span></div>"
    "</div></div>"
)
film = (
    'S.jsxDEV("section",{id:"elevation-film",className:"elevation-film",'
    '"aria-label":"Elevation A and B scroll sequence",'
    'dangerouslySetInnerHTML:{__html:' + json.dumps(film_markup, ensure_ascii=False) + '}},'
    'void 0,!1,{fileName:"/home/user/alpha-city/packages/web/src/web/pages/index.tsx",lineNumber:25,columnNumber:7},this),'
)
code = code.replace(clubhouse, clubhouse + film)
bundle.write_text(code, encoding="utf-8")

html = root / "index.html"
text = html.read_text(encoding="utf-8")
for old, new in {
    'assets/index-zqRoXS94.js?v=12': 'assets/index-zqRoXS94.js?v=13',
    '    <script defer src="assets/hero-sequence-player.js?v=28"></script>':
        '    <script defer src="assets/hero-sequence-player.js?v=28"></script>\n    <script defer src="assets/elevation-film.js?v=1"></script>',
    '    <link rel="stylesheet" href="assets/sequence-journey.css?v=26">':
        '    <link rel="stylesheet" href="assets/sequence-journey.css?v=26">\n    <link rel="stylesheet" href="assets/elevation-film.css?v=1">',
}.items():
    if text.count(old) != 1:
        raise RuntimeError(f"Could not find exactly one {old}")
    text = text.replace(old, new)
html.write_text(text, encoding="utf-8")
print("Elevation scroll film inserted between the clubhouse and the elevation gallery.")
