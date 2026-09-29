"""Stage the three supplied JPG sequences as full-resolution WebP frames.

Run from any directory with Pillow installed. Source JPGs are kept. The output
folders are staged separately so the live site can switch only after all frames
have converted and passed validation.
"""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SEQUENCES = (("001", "01"), ("002", "03"), ("003", "04"))


def convert(job):
    source, target, expected_size = job
    temporary = target.with_suffix(".webp.tmp")
    with Image.open(source) as image:
        if image.size != expected_size:
            raise ValueError(f"Unexpected dimensions in {source}: {image.size}")
        image.convert("RGB").save(temporary, "WEBP", quality=95, method=6)
    temporary.replace(target)
    return target.stat().st_size


if __name__ == "__main__":
    for source_folder, scene in SEQUENCES:
        sources = sorted((ROOT / source_folder).glob("*.jpg"))
        if not sources:
            raise SystemExit(f"No JPG frames found in {source_folder}/")
        with Image.open(sources[0]) as first:
            expected_size = first.size
        destination = ROOT / "images" / f"sequence-next-{scene}"
        destination.mkdir(parents=True, exist_ok=True)
        jobs = [(source, destination / f"{index:03}.webp", expected_size)
                for index, source in enumerate(sources)]
        sizes = []
        print(f"{source_folder} -> sequence-next-{scene}: converting {len(jobs)} "
              f"frames at {expected_size[0]}x{expected_size[1]}", flush=True)
        with ThreadPoolExecutor(max_workers=6) as pool:
            for size in pool.map(convert, jobs):
                sizes.append(size)
                if len(sizes) % 24 == 0 or len(sizes) == len(jobs):
                    print(f"  {len(sizes)}/{len(jobs)}", flush=True)
        for old_frame in destination.glob("[0-9][0-9][0-9].webp"):
            if int(old_frame.stem) >= len(jobs):
                old_frame.unlink()
        original = sum(source.stat().st_size for source in sources)
        if len(list(destination.glob("[0-9][0-9][0-9].webp"))) != len(sources):
            raise RuntimeError(f"Frame count mismatch in {destination}")
        print(f"  done: {sum(sizes) / 1e6:.1f} MB WebP "
              f"(source JPG: {original / 1e6:.1f} MB)", flush=True)
