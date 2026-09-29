from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "a": {
        "folder": ROOT / "Elevation_A",
        "files": {
            "lobby": "Lobby.jpeg",
            "tv-wall": "TV_Wall.jpeg",
            "kitchen": "Kitchen.jpg",
            "bedroom-01": "Bedroom_01.jpeg",
            "bedroom-02": "Bedroom_02.jpg",
            "room-02": "Room_02.jpg",
            "bathroom": "Bathroom.jpg",
        },
    },
    "b": {
        "folder": ROOT / "Elevation_B",
        "files": {
            "lobby": "Lobby.jpg",
            "tv-wall": "TV_Wall_Area.jpg",
            "kitchen": "Kitchen.jpg",
            "room-01": "Room_01.jpg",
            "room-02": "Room_02.jpg",
            "room-03": "Room_03.jpg",
            "room-04": "Room_04.jpg",
            "bathroom": "Bathroom.jpg",
        },
    },
}


for elevation, config in SOURCES.items():
    output = ROOT / "images" / "showcase" / f"elevation-{elevation}" / "2026"
    thumbnails = output / "thumbs"
    thumbnails.mkdir(parents=True, exist_ok=True)

    for stem, filename in config["files"].items():
        source = config["folder"] / filename
        if not source.is_file():
            raise FileNotFoundError(source)

        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            full_path = output / f"{stem}.webp"
            image.save(full_path, "WEBP", quality=95, method=6)

            thumb = image.copy()
            thumb.thumbnail((480, 480), Image.Resampling.LANCZOS)
            thumb_path = thumbnails / f"{stem}.webp"
            thumb.save(thumb_path, "WEBP", quality=88, method=6)

        print(f"{elevation.upper()} {filename}: {image.width}x{image.height} -> {full_path.stat().st_size:,} bytes; thumb {thumb_path.stat().st_size:,} bytes")
