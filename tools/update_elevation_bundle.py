from pathlib import Path


root = Path(__file__).resolve().parents[1]
bundle = root / "assets" / "index-zqRoXS94.js"
text = bundle.read_text(encoding="utf-8")

replacements = {
    'backdrop:"images/showcase/elevation-a/living.webp"': 'backdrop:"images/showcase/elevation-a/2026/lobby.webp"',
    'backdrop:"images/elev-b-1.jpg"': 'backdrop:"images/showcase/elevation-b/2026/lobby.webp"',
    'copy:"Stone-clad frames and deep verandahs wrap an internal court, so every room borrows light from two sides. Interiors run warm and quiet: lime plaster, oak, brushed brass."': 'copy:"Explore the warm, considered interiors of Elevation A, from its generous living spaces to the bedrooms, kitchen and bath. Each render reveals another detail of the home."',
    'copy:"A leaner, taller footprint that opens fully to the rear garden. Full-height glazing, a floating stair and a roof deck that clears the treeline."': 'copy:"Step inside Elevation B through its welcoming living and dining space, then discover the lounge, kitchen, bedrooms and bath in the new render collection."',
    'items:[{id:"b-ext",label:"Street Elevation",caption:"Elevation B — exterior",image:"images/elev-b-1.jpg"},{id:"b-din",label:"Dining & Kitchen",caption:"Elevation B — interior",image:"images/elev-b-2.jpg"},{id:"b-stair",label:"Stair Hall",caption:"Elevation B — interior",image:"images/elev-b-3.jpg"},{id:"b-roof",label:"Roof Deck",caption:"Elevation B — exterior",image:"images/club-2.jpg"}]': 'items:window.showcaseMedia.elevationB',
    'src:"images/elev-a-2.jpg",label:"Elevation A"': 'src:"images/showcase/elevation-a/2026/thumbs/lobby.webp",label:"Elevation A"',
    'src:"images/elev-b-3.jpg",label:"Elevation B"': 'src:"images/showcase/elevation-b/2026/thumbs/lobby.webp",label:"Elevation B"',
    'src:ae.image,alt:"",className:"h-full w-full object-cover transition-all duration-700"': 'src:ae.thumb||ae.image,alt:"",loading:"lazy",decoding:"async",className:"h-full w-full object-cover transition-all duration-700"',
    'src:ae.image,alt:ae.label,className:"h-full w-full object-cover"': 'src:ae.image,alt:ae.label,loading:"lazy",decoding:"async",className:"h-full w-full object-cover"',
}

for original, updated in replacements.items():
    count = text.count(original)
    if count != 1:
        raise RuntimeError(f"Expected one match, found {count}: {original[:100]}")
    text = text.replace(original, updated)

bundle.write_text(text, encoding="utf-8")

html = root / "index.html"
text = html.read_text(encoding="utf-8")
for original, updated in {
    'assets/showcase-media.js?v=1': 'assets/showcase-media.js?v=2',
    'assets/index-zqRoXS94.js?v=11': 'assets/index-zqRoXS94.js?v=12',
}.items():
    count = text.count(original)
    if count != 1:
        raise RuntimeError(f"Expected one match, found {count}: {original}")
    text = text.replace(original, updated)
html.write_text(text, encoding="utf-8")

print("Updated gallery configuration, previews, image loading, and cache versions.")
