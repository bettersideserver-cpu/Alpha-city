from pathlib import Path
from PIL import Image, ImageOps


root = Path(__file__).resolve().parents[1]
sources = sorted((root / "_incoming_elevation_sequence").glob("Video13_*.jpg"))
if len(sources) != 144:
    raise RuntimeError(f"Expected 144 frames, found {len(sources)}")

output = root / "images" / "sequence-elevations"
output.mkdir(parents=True, exist_ok=True)
for index, source in enumerate(sources):
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        if image.size != (1920, 1080):
            raise RuntimeError(f"Unexpected dimensions for {source.name}: {image.size}")
        image.save(output / f"{index:03d}.webp", "WEBP", quality=94, method=6)
    if index % 24 == 23 or index == len(sources) - 1:
        print(f"Prepared {index + 1}/{len(sources)} frames", flush=True)

size = sum(file.stat().st_size for file in output.glob("*.webp"))
print(f"Total WebP size: {size / (1024 * 1024):.1f} MiB")
