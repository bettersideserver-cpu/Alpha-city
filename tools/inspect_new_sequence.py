from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
files = sorted((root / "_incoming_elevation_sequence").glob("*.jpg"))
if len(files) != 144:
    raise RuntimeError(f"Expected 144 frames, found {len(files)}")

chosen = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 143]
canvas = Image.new("RGB", (4 * 380, 4 * 242), "#f3f1ed")
draw = ImageDraw.Draw(canvas)
for n, index in enumerate(chosen):
    with Image.open(files[index]) as source:
        if index in (0, 72, 143):
            print(index, source.size, source.mode)
        image = source.copy()
        image.thumbnail((370, 208), Image.Resampling.LANCZOS)
    x = n % 4 * 380
    y = n // 4 * 242
    canvas.paste(image, (x, y))
    draw.text((x + 8, y + 210), f"Frame {index:03d}", fill="#171717")
out = root / "_incoming_elevation_sequence" / "contact-sheet.jpg"
canvas.save(out, quality=90)
print(out)
