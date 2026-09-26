"""Convert the supplied JPG sequences to numbered, full-resolution WebP frames.

Run from any directory: python scripts/convert-sequences.py
Original JPGs are retained. Existing output frames are skipped.
"""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]


def convert(job):
    source, target = job
    if not target.exists():
        with Image.open(source) as image:
            image.convert("RGB").save(target, "WEBP", quality=88, method=6)
    return target.stat().st_size


if __name__ == "__main__":
    for sequence in ("02", "03", "04"):
        sources = sorted((ROOT / sequence).glob("*.jpg"))
        if not sources:
            raise SystemExit(f"No JPG frames found in {sequence}/")
        destination = ROOT / "images" / f"sequence-{sequence}"
        destination.mkdir(parents=True, exist_ok=True)
        jobs = [(source, destination / f"{index:03}.webp")
                for index, source in enumerate(sources)]
        with ThreadPoolExecutor(max_workers=4) as pool:
            sizes = list(pool.map(convert, jobs))
        original = sum(source.stat().st_size for source in sources)
        print(f"{sequence}: {len(sizes)} frames, {sum(sizes) / 1e6:.1f} MB "
              f"(JPG: {original / 1e6:.1f} MB)", flush=True)
