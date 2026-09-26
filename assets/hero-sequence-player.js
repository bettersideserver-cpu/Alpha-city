(() => {
  const FRAME_COUNT = 210;
  const FRAME_FOLDER = "images/sequence-01";
  const PRELOAD_AHEAD = 24;
  const PRELOAD_BEHIND = 10;
  const MAX_PARALLEL_LOADS = 8;

  function mount(canvas) {
    const section = document.getElementById("top");
    const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!section || !context) return;

    const images = new Array(FRAME_COUNT);
    const state = new Uint8Array(FRAME_COUNT); // 0 idle, 1 queued, 2 loading, 3 ready
    const queue = [];
    let activeLoads = 0;
    let currentFrame = 0;
    let drawnFrame = -1;
    let ticking = false;

    function drawFrame(frame) {
      const image = images[frame];
      if (!image || !image.complete || !image.naturalWidth) return;

      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, x, y, width, height);
      drawnFrame = frame;
    }

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * scale));
      canvas.height = Math.max(1, Math.round(bounds.height * scale));
      drawFrame(state[currentFrame] === 3 ? currentFrame : drawnFrame);
    }

    function pump() {
      while (activeLoads < MAX_PARALLEL_LOADS && queue.length) {
        const index = queue.shift();
        if (state[index] !== 1) continue;

        state[index] = 2;
        activeLoads++;
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          activeLoads--;
          images[index] = image;
          state[index] = 3;
          if (index === currentFrame) drawFrame(index);
          pump();
        };
        image.onerror = () => {
          activeLoads--;
          state[index] = 0;
          pump();
        };
        image.src = `${FRAME_FOLDER}/${String(index).padStart(3, "0")}.webp`;
      }
    }

    function preloadAround(frame) {
      const priority = [frame];
      for (let distance = 1; distance <= PRELOAD_AHEAD; distance++) {
        if (frame + distance < FRAME_COUNT) priority.push(frame + distance);
        if (distance <= PRELOAD_BEHIND && frame - distance >= 0) priority.push(frame - distance);
      }
      const fresh = priority.filter((index) => {
        if (state[index]) return false;
        state[index] = 1;
        return true;
      });
      queue.unshift(...fresh);
      pump();

      // Limit decoded 1920x1080 frames in memory. Revisited frames use browser cache.
      for (let index = 0; index < FRAME_COUNT; index++) {
        if (state[index] === 3 && Math.abs(index - frame) > 40) {
          images[index] = undefined;
          state[index] = 0;
        }
      }
    }

    function updateFrame() {
      const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / scrollRange));
      const frame = Math.floor(progress * (FRAME_COUNT - 1));

      if (frame !== currentFrame) currentFrame = frame;
      if (state[currentFrame] === 3 && drawnFrame !== currentFrame) drawFrame(currentFrame);
      preloadAround(currentFrame);
    }

    function scheduleUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateFrame();
      });
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", () => {
      resizeCanvas();
      scheduleUpdate();
    });
    resizeCanvas();
    updateFrame();
  }

  function findCanvas() {
    const canvas = document.getElementById("hero-sequence");
    if (!canvas) return false;
    mount(canvas);
    return true;
  }

  if (!findCanvas()) {
    const watcher = new MutationObserver(() => {
      if (findCanvas()) watcher.disconnect();
    });
    watcher.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
