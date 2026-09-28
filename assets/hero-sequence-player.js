(() => {
  "use strict";

  // Positions are viewport heights. Each scene holds its last frame for its story.
  const SCENES = [
    { folder: "01", count: 288, start: 0, end: 5.6, blendStart: 7, blendEnd: 7.35,
      label: "01 / THE ENTRANCE", title: ["The arrival"], description: "The first view of a city made for the way you want to live." },
    { folder: "02", count: 216, start: 7.35, end: 11.55, blendStart: 12.95, blendEnd: 13.3,
      label: "02 / THE HIGH STREET", title: ["Everyday,", "within reach"], description: "A lively commercial heart connects the places you visit every day." },
    { folder: "03", count: 288, start: 13.3, end: 18.9, captionExit: 19.95, blendStart: 20.7, blendEnd: 21,
      label: "03 / THE CLUBHOUSE", title: ["Space to come", "together"], description: "Forty-five thousand square feet for leisure, quiet moments and time with neighbours." },
    { folder: "04", count: 216, start: 21, end: 25.25,
      label: "04 / THE GARDENS", title: ["A greener", "everyday"], description: "Open green is woven through the city, always a short walk from home." },
  ];
  const TOTAL_TRAVEL = 26.65;
  const MAX_LOADS = 6;
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const smooth = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };
  function mount() {
  const section = document.getElementById("top");
  const canvas = document.getElementById("hero-sequence");
  const stage = section?.querySelector(".hero-sticky-stage");
  const context = canvas?.getContext("2d", { alpha: false, desynchronized: true });
  if (!section || !stage || !context) return false;
  const anchor = document.createElement("span");
  anchor.id = "journey";
  anchor.className = "journey-anchor";
  anchor.dataset.position = String(SCENES[1].start);
  anchor.setAttribute("aria-hidden", "true");
  section.append(anchor);
  const gardenAnchor = document.createElement("span");
  gardenAnchor.id = "gardens";
  gardenAnchor.className = "journey-anchor";
  gardenAnchor.dataset.position = "21";
  gardenAnchor.setAttribute("aria-hidden", "true");
  section.append(gardenAnchor);

  const nav = document.querySelector("main > header");
  const hero = stage.querySelector(":scope > .flex-1");
  hero.classList.add("hero-copy");
  stage.querySelectorAll(":scope > .pointer-events-none.absolute.inset-0").forEach((shade) => shade.classList.add("sequence-hero-shade"));
  canvas.style.backgroundImage = "url('images/sequence-01/000.webp?v=2')";
  const captions = SCENES.map((scene, index) => {
    const caption = document.createElement("section");
    caption.className = "sequence-caption";
    caption.setAttribute("aria-label", scene.label.replace(/^\d+ \/ /, ""));
    caption.setAttribute("aria-hidden", "true");
    caption.innerHTML = `<div class="sequence-caption__inner">
      <div class="sequence-caption__primary">
        <span class="sequence-caption__label">${scene.label}</span>
        <h2 class="sequence-caption__title">${scene.title.map((line) => `<span>${line}</span>`).join("")}</h2>
      </div>
      <div class="sequence-caption__secondary">
        <p class="sequence-caption__description">${scene.description}</p>
        <span class="sequence-caption__progress" aria-hidden="true"><span></span></span>
        <span class="sequence-caption__next">${index < SCENES.length - 1 ? "SCROLL TO EXPLORE" : "CONTINUE TO THE MASTERPLAN"}</span>
      </div>
    </div>`;
    stage.append(caption);
    return caption;
  });
  const skyBridge = document.createElement("section");
  skyBridge.className = "sequence-sky-bridge";
  skyBridge.setAttribute("aria-label", "Introduction to the gardens");
  skyBridge.setAttribute("aria-hidden", "true");
  skyBridge.innerHTML = `<div class="sequence-sky-bridge__inner">
    <span class="sequence-sky-bridge__label"><span aria-hidden="true"></span>FROM THE CLUBHOUSE TO THE GARDENS</span>
    <h2 class="sequence-sky-bridge__title">The city opens<br><em>to the sky.</em></h2>
    <p class="sequence-sky-bridge__description">Where shared spaces give way to open green.</p>
    <span class="sequence-sky-bridge__rule" aria-hidden="true"><span></span></span>
  </div>
  <span class="sequence-sky-bridge__folio" aria-hidden="true">04 <span>/</span> 04<br><small>THE GARDENS</small></span>`;
  stage.append(skyBridge);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 640px)");
  const cache = new Map();
  let queue = [];
  let wanted = new Set();
  let activeLoads = 0;
  let raf = 0;
  let direction = 1;
  let previousPosition = 0;
  let lastDraw = "";
  let current = { scene: 0, frame: 0, blend: 0 };

  const keyFor = (scene, frame) => `${scene}:${frame}`;
  const pathFor = (scene, frame) => `images/sequence-${SCENES[scene].folder}/${String(frame).padStart(3, "0")}.webp?v=2`;

  function trimCache() {
    // Each decoded Full-HD frame is ~8 MB. Revisited frames use the HTTP cache.
    const limit = compact.matches ? 18 : 30;
    for (const [key, record] of cache) {
      if (cache.size <= limit) break;
      if (record.status !== "loading" && !wanted.has(key)) cache.delete(key);
    }
  }

  function pump() {
    while (activeLoads < MAX_LOADS && queue.length) {
      const { scene, frame, key } = queue.shift();
      if (cache.has(key)) continue;
      const image = new Image();
      const record = { image, scene, frame, status: "loading" };
      cache.set(key, record);
      activeLoads++;
      image.decoding = "async";
      image.onload = async () => {
        try { await image.decode(); } catch (_) { /* onload supplies a usable image */ }
        record.status = "ready";
        activeLoads--;
        trimCache();
        schedule();
        pump();
      };
      image.onerror = () => {
        record.status = "failed";
        record.retryAt = Date.now() + 5000;
        activeLoads--;
        trimCache();
        pump();
      };
      image.src = pathFor(scene, frame);
    }
  }

  function preload(position) {
    const requests = [];
    const keys = new Set();
    const add = (scene, frame) => {
      if (scene < 0 || scene >= SCENES.length || frame < 0 || frame >= SCENES[scene].count) return;
      const key = keyFor(scene, frame);
      if (keys.has(key)) return;
      keys.add(key);
      requests.push({ scene, frame, key });
    };
    const { scene, frame, blend } = current;
    add(scene, frame);
    if (blend > 0) add(scene + 1, 0);
    const ahead = compact.matches ? 8 : 14;
    const behind = compact.matches ? 3 : 5;
    for (let distance = 1; distance <= ahead; distance++) {
      add(scene, frame + distance * direction);
      if (distance <= behind) add(scene, frame - distance * direction);
    }
    const info = SCENES[scene];
    if (scene < SCENES.length - 1 && position >= info.end - .7) {
      add(scene + 1, 0);
      add(scene + 1, 1);
    }
    if (scene > 0 && position <= info.start + .7) add(scene - 1, SCENES[scene - 1].count - 1);
    wanted = keys;
    // A fast scroll replaces queued work with the newest target frames.
    queue = requests.filter(({ key }) => {
      const record = cache.get(key);
      if (record?.status === "failed" && Date.now() >= record.retryAt) cache.delete(key);
      return !cache.has(key);
    });
    trimCache();
    pump();
  }

  function nearestReady(scene, frame) {
    const exact = cache.get(keyFor(scene, frame));
    if (exact?.status === "ready") return exact;
    let closest = null;
    for (const record of cache.values()) {
      if (record.scene !== scene || record.status !== "ready") continue;
      if (!closest || Math.abs(record.frame - frame) < Math.abs(closest.frame - frame)) closest = record;
    }
    return closest;
  }

  function paint(image) {
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }

  function render() {
    const { scene, frame, blend } = current;
    const base = nearestReady(scene, frame);
    const next = blend > 0 ? nearestReady(scene + 1, 0) : null;
    // Retain the painted frame while a new target decodes; never clear to black.
    if (!base) return;
    const signature = `${scene}:${base.frame}:${next ? blend.toFixed(5) : 0}:${canvas.width}:${canvas.height}`;
    if (signature === lastDraw) return;
    context.globalAlpha = 1;
    paint(base.image);
    if (next) {
      context.globalAlpha = blend;
      paint(next.image);
      context.globalAlpha = 1;
    }
    lastDraw = signature;
    canvas.dataset.sequence = SCENES[scene].folder;
    canvas.dataset.frame = String(base.frame);
    canvas.dataset.blend = String(blend);
  }

  function update() {
    raf = 0;
    const travel = Math.max(1, section.offsetHeight - stage.clientHeight);
    const bounds = section.getBoundingClientRect();
    const position = clamp(-bounds.top / travel) * TOTAL_TRAVEL;
    if (Math.abs(position - previousPosition) > .001) direction = position > previousPosition ? 1 : -1;
    previousPosition = position;
    let scene = 0;
    while (scene < SCENES.length - 1 && position >= SCENES[scene + 1].start) scene++;
    const info = SCENES[scene];
    const playStart = info.playStart ?? info.start;
    const progress = clamp((position - playStart) / (info.end - playStart));
    const blendStart = info.blendStart ?? info.end;
    const blend = info.blendEnd ? smooth((position - blendStart) / (info.blendEnd - blendStart)) : 0;
    current = { scene, frame: Math.round(progress * (info.count - 1)), blend };

    captions.forEach((caption, index) => {
      const item = SCENES[index];
      const exit = item.captionExit ?? item.blendStart ?? TOTAL_TRAVEL;
      const enterAmount = smooth((position - item.end) / .42);
      const leaveAmount = index < SCENES.length - 1
        ? 1 - smooth((position - (exit - .28)) / .35)
        : 1 - smooth((position - (TOTAL_TRAVEL - .55)) / .55);
      // A rapid scroll may reach the hold before its final WebP has decoded.
      // Keep the story hidden until that actual last frame is ready to paint.
      const finalFrameReady = cache.get(keyFor(index, item.count - 1))?.status === "ready";
      const visibility = finalFrameReady ? enterAmount * leaveAmount : 0;
      caption.style.setProperty("--caption-visibility", String(visibility));
      caption.style.setProperty("--caption-rise", `${reducedMotion.matches ? 0 : (1 - enterAmount) * 24}px`);
      caption.style.setProperty("--caption-line", String(smooth((position - item.end) / .9)));
      caption.setAttribute("aria-hidden", visibility < .2 ? "true" : "false");
    });
    const bridgeArrival = smooth((position - 19.85) / .5);
    const bridgeDeparture = 1 - smooth((position - 21) / .7);
    const bridgeOpacity = bridgeArrival * bridgeDeparture;
    const bridgeWords = smooth((position - 20.15) / .4)
      * (1 - smooth((position - 21.02) / .43));
    skyBridge.style.setProperty("--bridge-opacity", String(bridgeOpacity));
    skyBridge.style.setProperty("--bridge-words", String(bridgeWords));
    skyBridge.style.setProperty("--bridge-rise", `${reducedMotion.matches ? 0 : (1 - bridgeWords) * 28}px`);
    skyBridge.setAttribute("aria-hidden", bridgeOpacity * bridgeWords < .2 ? "true" : "false");

    // Logo opening, hero, then a quiet 8px fade at the middle arrival frame.
    const fade = smooth((position - 2.05) / .65);
    const heroOpacity = 1 - fade;
    section.style.setProperty("--hero-opacity", String(heroOpacity));
    section.style.setProperty("--hero-lift", `${reducedMotion.matches ? 0 : -fade * 8}px`);
    section.style.setProperty("--shade-opacity", String(1 - fade));
    const inHero = bounds.bottom > stage.clientHeight && bounds.top <= 0;
    nav.classList.toggle("sequence-nav-in-hero", inHero);
    nav.style.setProperty("--sequence-nav-opacity", String(hero.childElementCount ? heroOpacity : 0));
    nav.style.setProperty("--sequence-nav-lift", `${reducedMotion.matches ? 0 : -fade * 8}px`);
    nav.inert = inHero && heroOpacity < .05;
    hero.inert = heroOpacity < .05;
    section.dataset.position = position.toFixed(3);
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
      queue = [];
      return;
    }
    preload(position);
    render();
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(stage.clientWidth * scale));
    const height = Math.max(1, Math.round(stage.clientHeight * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      lastDraw = "";
      render();
    }
    const travel = section.offsetHeight - stage.clientHeight;
    section.querySelectorAll(".journey-anchor").forEach((anchor) => {
      anchor.style.top = `${Number(anchor.dataset.position) / TOTAL_TRAVEL * travel}px`;
    });
    schedule();
  }

  function followHash() {
    const anchor = document.getElementById(location.hash.slice(1));
    if (anchor && (anchor.id === "top" || anchor.classList.contains("journey-anchor"))) {
      window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
      schedule();
    }
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("hashchange", followHash);
  window.addEventListener("pageshow", schedule);
  reducedMotion.addEventListener("change", schedule);
  new ResizeObserver(resize).observe(stage);
  resize();
  followHash();
  update();
  return true;
  }

  // The static export mounts its existing React hero after this deferred script.
  if (!mount()) {
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
