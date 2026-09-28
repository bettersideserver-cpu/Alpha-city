"""Replace sequence 03 with the supplied full-resolution JPG frames.

Run from any directory: python scripts/convert-sequences.py
The supplied JPGs in 03/ are kept. Existing WebP frames are replaced atomically.
"""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SEQUENCES = (("03", "03"),)


def convert(job):
    source, target = job
    temporary = target.with_suffix(".webp.tmp")
    with Image.open(source) as image:
        image.convert("RGB").save(temporary, "WEBP", quality=95, method=6)
    temporary.replace(target)
    return target.stat().st_size


if __name__ == "__main__":
    for source_folder, scene in SEQUENCES:
        sources = sorted((ROOT / source_folder).glob("*.jpg"))
        if not sources:
            raise SystemExit(f"No JPG frames found in {source_folder}/")
        destination = ROOT / "images" / f"sequence-{scene}"
        destination.mkdir(parents=True, exist_ok=True)
        jobs = [(source, destination / f"{index:03}.webp")
                for index, source in enumerate(sources)]
        sizes = []
        print(f"{source_folder} -> sequence-{scene}: converting {len(jobs)} frames", flush=True)
        with ThreadPoolExecutor(max_workers=4) as pool:
            for size in pool.map(convert, jobs):
                sizes.append(size)
                if len(sizes) % 24 == 0 or len(sizes) == len(jobs):
                    print(f"  {len(sizes)}/{len(jobs)}", flush=True)
        for old_frame in destination.glob("[0-9][0-9][0-9].webp"):
            if int(old_frame.stem) >= len(jobs):
                old_frame.unlink()
        original = sum(source.stat().st_size for source in sources)
        print(f"  done: {sum(sizes) / 1e6:.1f} MB WebP "
              f"(source JPG: {original / 1e6:.1f} MB)", flush=True)
