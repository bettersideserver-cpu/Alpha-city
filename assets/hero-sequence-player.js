(() => {
  const FRAME_COUNT = 210;
  const pathFor = (index) => `images/sequence-01/${String(index).padStart(3, "0")}.webp`;

  function mount(canvas) {
    const section = document.getElementById("top");
    const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!section || !context) return;

    const frames = new Map();
    const requests = new Map();
    let wanted = 0;
    let drawn = -1;
    let animationFrame = 0;

    function draw(index) {
      const image = frames.get(index);
      if (!image || drawn === index) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      drawn = index;
    }

    function load(index) {
      if (index < 0 || index >= FRAME_COUNT || frames.has(index) || requests.has(index)) return;
      const image = new Image();
      image.decoding = "async";
      image.src = pathFor(index);
      const request = image.decode().then(() => {
        requests.delete(index);
        frames.set(index, image);
        if (index === wanted) draw(index);
        for (const key of frames.keys()) {
          if (Math.abs(key - wanted) > 22) frames.delete(key);
        }
      }).catch(() => requests.delete(index));
      requests.set(index, request);
    }

    function update() {
      animationFrame = 0;
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / travel));
      wanted = Math.round(progress * (FRAME_COUNT - 1));
      draw(wanted);
      load(wanted);
      for (let index = Math.max(0, wanted - 8); index <= Math.min(FRAME_COUNT - 1, wanted + 18); index++) {
        load(index);
      }
    }

    function schedule() {
      if (!animationFrame) animationFrame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    load(0);
    schedule();
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
