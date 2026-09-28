"""Create web copies of the supplied gallery media; keep all source files."""
from pathlib import Path
import subprocess
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
GALLERIES = {
    "clubhouse": ("Clubb_Area", {
        "Reception_Area.jpg": "reception", "Bar_Area.jpg": "bar",
        "Resturant_Area.png": "restaurant", "Cards_Playing Area.jpg": "cards",
        "Kids_Area.jpg": "kids", "GYM.jpg": "gym",
    }),
    "elevation-a": ("Elevation_A", {
        "Lobby.jpeg": "living", "TV_Wall.jpeg": "lounge",
        "Bedroom_01.jpeg": "bedroom-01", "Bedroom_02.jpeg": "bedroom-02",
        "Kitchen.jpg": "kitchen",
    }),
}

for gallery, (source, files) in GALLERIES.items():
    destination = ROOT / "images" / "showcase" / gallery
    destination.mkdir(parents=True, exist_ok=True)
    for filename, slug in files.items():
        with Image.open(ROOT / source / filename) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            image.thumbnail((1920, 1440), Image.Resampling.LANCZOS)
            image.save(destination / f"{slug}.webp", quality=90, method=6)
        print(f"Prepared {gallery}/{slug}.webp", flush=True)

destination = ROOT / "videos" / "showcase"
destination.mkdir(parents=True, exist_ok=True)
for source, slug, width in [
    ("magnific_use-the-provided-still-re_gOnmENQSXO.mp4", "living", 1284),
    ("magnific_video-upscale_gOnmuhiSXO.mp4", "lounge", 1920),
]:
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(ROOT / "Elevation_A" / source), "-map", "0:v:0",
        "-vf", f"scale={width}:-2", "-c:v", "libx264", "-crf", "21",
        "-preset", "medium", "-pix_fmt", "yuv420p", "-an",
        "-movflags", "+faststart", str(destination / f"elevation-a-{slug}.mp4"),
    ], check=True)
    print(f"Prepared elevation-a-{slug}.mp4", flush=True)
