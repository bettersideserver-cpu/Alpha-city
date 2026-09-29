(() => {
  "use strict";

  const FRAME_COUNT = 144;
  const MAX_IMAGE_LOADS = 5;
  const MAX_PREFETCH_LOADS = 3;
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smooth = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const source = (frame) => `images/sequence-elevations/${String(frame).padStart(3, "0")}.webp`;

  function mount() {
    const section = document.getElementById("elevation-film");
    const canvas = document.getElementById("elevation-film-canvas");
    const context = canvas?.getContext("2d", { alpha: false, desynchronized: true });
    if (!section || !canvas || !context) return false;

    const counter = section.querySelector("#elevation-film-count");
    const warmBlobs = new Map();
    const decoded = new Map();
    const loading = new Set();
    let queue = [];
    let activeImages = 0;
    let activePrefetch = 0;
    let prefetchCursor = 0;
    let wanted = 0;
    let drawn = -1;
    let raf = 0;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        drawn = -1;
      }
      draw();
    }

    function draw() {
      let frame = wanted;
      if (!decoded.has(frame)) {
        for (let offset = 1; offset < 18; offset++) {
          if (decoded.has(frame - offset)) { frame -= offset; break; }
          if (decoded.has(frame + offset)) { frame += offset; break; }
        }
      }
      const image = decoded.get(frame);
      if (!image || frame === drawn || !canvas.width || !canvas.height) return;

      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      drawn = frame;
    }

    function trimDecoded() {
      if (decoded.size <= 28) return;
      for (const frame of decoded.keys()) {
        if (decoded.size <= 24) break;
        if (Math.abs(frame - wanted) > 11) decoded.delete(frame);
      }
    }

    function pumpImages() {
      while (activeImages < MAX_IMAGE_LOADS && queue.length) {
        const frame = queue.shift();
        if (decoded.has(frame) || loading.has(frame)) continue;
        const image = new Image();
        const blob = warmBlobs.get(frame);
        const blobUrl = blob ? URL.createObjectURL(blob) : null;
        loading.add(frame);
        activeImages++;
        image.decoding = "async";

        const finish = () => {
          if (blobUrl) URL.revokeObjectURL(blobUrl);
          loading.delete(frame);
          activeImages--;
          pumpImages();
        };
        image.onload = async () => {
          try { await image.decode(); } catch (_) { /* A loaded image can still be drawn. */ }
          decoded.set(frame, image);
          trimDecoded();
          draw();
          finish();
        };
        image.onerror = finish;
        image.src = blobUrl || source(frame);
      }
    }

    function requestNearby(frame) {
      const next = [];
      for (let offset = 0; offset <= 12; offset++) {
        if (frame + offset < FRAME_COUNT) next.push(frame + offset);
        if (offset && frame - offset >= 0) next.push(frame - offset);
      }
      queue = next.filter((item) => !decoded.has(item) && !loading.has(item));
      pumpImages();
    }

    // Store compressed frames once on page load, while decoded frames stay capped.
    function pumpPrefetch() {
      while (activePrefetch < MAX_PREFETCH_LOADS && prefetchCursor < FRAME_COUNT) {
        const frame = prefetchCursor++;
        activePrefetch++;
        fetch(source(frame), { cache: "force-cache", priority: "low" })
          .then((response) => response.ok ? response.blob() : null)
          .then((blob) => {
            if (blob) warmBlobs.set(frame, blob);
            section.dataset.prefetchedFrames = String(warmBlobs.size);
          })
          .catch(() => { /* Visible frames still load directly. */ })
          .finally(() => { activePrefetch--; pumpPrefetch(); });
      }
    }

    function update() {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / travel);
      const movie = clamp(progress / .93);
      const frame = Math.round(movie * (FRAME_COUNT - 1));
      section.dataset.phase = movie < .65 ? "a" : "b";
      section.style.setProperty("--film-progress", movie.toFixed(4));
      section.style.setProperty("--film-out", smooth((progress - .94) / .06).toFixed(4));
      section.style.setProperty("--film-copy-opacity", (1 - smooth((progress - .9) / .08)).toFixed(4));
      if (counter) counter.textContent = `${String(frame + 1).padStart(3, "0")} / 144`;
      if (frame !== wanted) {
        wanted = frame;
        draw();
      }
      if (rect.top < window.innerHeight * 1.5 && rect.bottom > -window.innerHeight) {
        requestNearby(frame);
      }
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    requestNearby(0);
    resize();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", () => { resize(); schedule(); });
    if (document.readyState === "complete") pumpPrefetch();
    else window.addEventListener("load", pumpPrefetch, { once: true });
    return true;
  }

  if (!mount()) {
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.getElementById("root") || document.documentElement, { childList: true, subtree: true });
  }
})();
