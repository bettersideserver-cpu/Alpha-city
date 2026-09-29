(() => {
  "use strict";

  // Positions are viewport heights. Each scene holds its last frame for its story.
  const SCENES = [
    { folder: "01", count: 252, version: 4, start: 0, end: 5.6, blendStart: 7, blendEnd: 7.35,
      label: "01 / THE COMMERCIAL DISTRICT", title: ["The Commercial", "District"],
      description: "An active high street gives daily life a natural meeting point. Follow the planted boulevard to shops, everyday destinations and places to pause, all within the township.",
      highlights: [
        ["THE HIGH STREET", "A connected route for shopping, meeting and spending time together."],
        ["EVERYDAY CONVENIENCE", "Useful destinations sit close to the places people call home."],
        ["A GREEN APPROACH", "Planting brings a softer rhythm to the journey through the district."],
      ] },
    { folder: "03", count: 360, version: 4, start: 7.35, playStart: 9.45, end: 16.45, captionExit: 17.5, blendStart: 18.25, blendEnd: 18.55,
      label: "02 / THE CLUBHOUSE", title: ["The Clubhouse"],
      description: "A 45,000 sq. ft. setting for the moments that bring people together. From a quiet pause to a shared celebration, its spaces offer room to enjoy the day at your own pace.",
      highlights: [
        ["A WARM WELCOME", "Arrive in a generous reception designed to feel inviting."],
        ["ROOM TO CONNECT", "Lounge, play and dining spaces give every visit a different pace."],
        ["45,000 SQ. FT.", "A shared destination with space for leisure and gathering."],
      ] },
    { folder: "elevations", assetFolder: "sequence-elevations", count: 144, version: 1, start: 18.55, end: 21.9, blendStart: 23.05, blendEnd: 23.45,
      label: "03 / THE ELEVATIONS", title: ["Elevation A", "& Elevation B"],
      description: "Two distinct expressions of home come into view, one after the other. Move from the first elevation across to the second, then explore their interiors in the gallery below.",
      highlights: [
        ["ELEVATION A", "A warm approach framed by palms and light-filled living spaces."],
        ["ELEVATION B", "A distinct architectural character along the same residential streetscape."],
        ["STEP INSIDE", "Continue to the full render collection for both homes."],
      ] },
    { folder: "04", count: 312, version: 4, start: 23.45, end: 29.55,
      label: "04 / THE TOP VIEW", title: ["The City", "from Above"],
      description: "Seen from above, the township reads as one connected place. Homes, streets and open green are arranged around the everyday journey through Alpha International City.",
      highlights: [
        ["120 ACRES", "A complete township planned as one whole."],
        ["62% OPEN GREEN", "Landscape is a defining part of the masterplan."],
        ["840 RESIDENCES", "Homes connected to the places people share."],
      ] },
  ];
  const TOTAL_TRAVEL = 31.5;
  const CLUBHOUSE = SCENES.find((scene) => scene.folder === "03");
  const ELEVATIONS = SCENES.find((scene) => scene.folder === "elevations");
  const GARDENS = SCENES.find((scene) => scene.folder === "04");
  const MAX_LOADS = 6;
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const smooth = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };
  function mount() {
  const section = document.getElementById("top");
  const canvas = document.getElementById("hero-sequence");
  const stage = section?.querySelector(".hero-sticky-stage");
  const context = canvas?.getContext("2d", { alpha: false, desynchronized: true });
  if (!section || !stage || !context) return false;
  const masterplanCopy = document.querySelector(".masterplan-rise > div:first-child");
  if (masterplanCopy && !masterplanCopy.querySelector(".masterplan-details")) {
    const details = document.createElement("div");
    details.className = "masterplan-details";
    details.innerHTML = `
      <div class="masterplan-details__heading">
        <span class="masterplan-details__eyebrow">THE PLAN IN PRACTICE</span>
        <p>One connected journey,<br><em>many ways to live.</em></p>
      </div>
      <div class="masterplan-details__grid">
        <article>
          <span class="masterplan-details__number">01</span>
          <h3>A walkable sequence</h3>
          <p>The gate leads to the high street, clubhouse and gardens along one continuous route.</p>
        </article>
        <article>
          <span class="masterplan-details__number">02</span>
          <h3>Green close to home</h3>
          <p>Every residence is planned within a four-minute walk of open green.</p>
        </article>
        <article>
          <span class="masterplan-details__number">03</span>
          <h3>Space to move freely</h3>
          <p>Service roads stay clear of the pedestrian route, keeping the everyday walk uninterrupted.</p>
        </article>
      </div>`;
    masterplanCopy.append(details);
  }
  const anchor = document.createElement("span");
  anchor.id = "journey";
  anchor.className = "journey-anchor";
  anchor.dataset.position = String(SCENES[1].start);
  anchor.setAttribute("aria-hidden", "true");
  section.append(anchor);
  const elevationAnchor = document.createElement("span");
  elevationAnchor.id = "elevation-film";
  elevationAnchor.className = "journey-anchor";
  elevationAnchor.dataset.position = String(ELEVATIONS.start);
  elevationAnchor.setAttribute("aria-hidden", "true");
  section.append(elevationAnchor);
  const gardenAnchor = document.createElement("span");
  gardenAnchor.id = "gardens";
  gardenAnchor.className = "journey-anchor";
  gardenAnchor.dataset.position = String(GARDENS.start);
  gardenAnchor.setAttribute("aria-hidden", "true");
  section.append(gardenAnchor);

  const nav = document.querySelector("main > header");
  const hero = stage.querySelector(":scope > .flex-1");
  hero.classList.add("hero-copy");
  function tagHeroContent() {
    const title = hero.querySelector("h1");
    if (!title) return false;
    hero.children[0]?.classList.add("sequence-hero-kicker");
    title.classList.add("sequence-hero-title");
    hero.querySelector("h1 + div")?.classList.add("sequence-hero-brand");
    hero.querySelector("h1 + div + div")?.classList.add("sequence-hero-details");
    return true;
  }
  if (!tagHeroContent()) {
    const heroObserver = new MutationObserver(() => {
      if (tagHeroContent()) heroObserver.disconnect();
    });
    heroObserver.observe(hero, { childList: true, subtree: true });
  }
  stage.querySelectorAll(":scope > .pointer-events-none.absolute.inset-0").forEach((shade) => shade.classList.add("sequence-hero-shade"));
  canvas.style.backgroundImage = "url('images/sequence-01/000.webp?v=4')";
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
        <div class="sequence-caption__highlights">
          <span class="sequence-caption__highlights-label">AT A GLANCE</span>
          <ul>${scene.highlights.map(([heading, detail], itemIndex) => `<li><span class="sequence-caption__highlight-number">0${itemIndex + 1}</span><div><strong>${heading}</strong><span>${detail}</span></div></li>`).join("")}</ul>
        </div>
        <span class="sequence-caption__progress" aria-hidden="true"><span></span></span>
        <span class="sequence-caption__next">${index < SCENES.length - 1 ? "SCROLL TO CONTINUE" : "DISCOVER THE MASTERPLAN"}</span>
      </div>
    </div>`;
    stage.append(caption);
    return caption;
  });
  const clubhouseIntro = document.createElement("section");
  clubhouseIntro.className = "sequence-clubhouse-intro";
  clubhouseIntro.setAttribute("aria-label", "Life at the clubhouse");
  clubhouseIntro.setAttribute("aria-hidden", "true");
  clubhouseIntro.innerHTML = `
    <div class="clubhouse-intro__viewer" aria-hidden="true">
      <div class="clubhouse-intro__viewer-head"><span>A GLIMPSE INSIDE</span><span class="clubhouse-intro__viewer-count">01 / 04</span></div>
      <div class="clubhouse-intro__photos">
        <figure class="clubhouse-intro__photo clubhouse-intro__photo--welcome">
          <img src="images/clubhouse-intro/reception.webp" alt="" width="800" height="527" decoding="async">
          <figcaption>01 &nbsp; A warm welcome</figcaption>
        </figure>
        <figure class="clubhouse-intro__photo clubhouse-intro__photo--play">
          <img src="images/clubhouse-intro/play.webp" alt="" width="800" height="525" decoding="async">
          <figcaption>02 &nbsp; Little moments of joy</figcaption>
        </figure>
        <figure class="clubhouse-intro__photo clubhouse-intro__photo--lounge">
          <img src="images/clubhouse-intro/lounge.webp" alt="" width="800" height="527" decoding="async">
          <figcaption>03 &nbsp; Stay a little longer</figcaption>
        </figure>
        <figure class="clubhouse-intro__photo clubhouse-intro__photo--dine">
          <img src="images/clubhouse-intro/dining.webp" alt="" width="800" height="525" decoding="async">
          <figcaption>04 &nbsp; Gather around</figcaption>
        </figure>
      </div>
      <div class="clubhouse-intro__viewer-foot"><span>SPACES TO MAKE YOUR OWN</span><div class="clubhouse-intro__viewer-steps"><span></span><span></span><span></span><span></span></div></div>
    </div>
    <div class="clubhouse-intro__copy">
      <span class="clubhouse-intro__eyebrow">THE CLUBHOUSE &nbsp; / &nbsp; 45,000 SQ. FT.</span>
      <h2>Life, beautifully<br><em>shared.</em></h2>
      <p>A place to slow down. A reason to come together.</p>
    </div>
    <span class="clubhouse-intro__scroll" aria-hidden="true">SCROLL THROUGH THE SPACES<span></span></span>`;
  stage.append(clubhouseIntro);
  const introPhotos = [...clubhouseIntro.querySelectorAll(".clubhouse-intro__photo")];
  const introCount = clubhouseIntro.querySelector(".clubhouse-intro__viewer-count");
  const introSteps = [...clubhouseIntro.querySelectorAll(".clubhouse-intro__viewer-steps span")];
  const introCopy = clubhouseIntro.querySelector(".clubhouse-intro__copy");
  const introScroll = clubhouseIntro.querySelector(".clubhouse-intro__scroll");
  const skyBridge = document.createElement("section");
  skyBridge.className = "sequence-sky-bridge";
  skyBridge.setAttribute("aria-label", "Introduction to the elevations");
  skyBridge.setAttribute("aria-hidden", "true");
  skyBridge.innerHTML = `<div class="sequence-sky-bridge__inner">
    <span class="sequence-sky-bridge__label"><span aria-hidden="true"></span>FROM THE CLUBHOUSE TO THE RESIDENCES</span>
    <h2 class="sequence-sky-bridge__title">A place to<br><em>call your own.</em></h2>
    <p class="sequence-sky-bridge__description">From the places we share to the homes we return to.</p>
    <span class="sequence-sky-bridge__rule" aria-hidden="true"><span></span></span>
  </div>
  <span class="sequence-sky-bridge__folio" aria-hidden="true">03 <span>/</span> 04<br><small>THE ELEVATIONS</small></span>`;
  stage.append(skyBridge);
  const gardenBridge = document.createElement("section");
  gardenBridge.className = "sequence-sky-bridge sequence-sky-bridge--gardens";
  gardenBridge.setAttribute("aria-label", "Introduction to the top view");
  gardenBridge.setAttribute("aria-hidden", "true");
  gardenBridge.innerHTML = `<div class="sequence-sky-bridge__inner">
    <span class="sequence-sky-bridge__label"><span aria-hidden="true"></span>THE GARDENS &nbsp; / &nbsp; THE TOP VIEW</span>
    <h2 class="sequence-sky-bridge__title">The city opens<br><em>to the sky.</em></h2>
    <p class="sequence-sky-bridge__description">See the township and its open green from a new perspective.</p>
    <span class="sequence-sky-bridge__rule" aria-hidden="true"><span></span></span>
  </div>
  <span class="sequence-sky-bridge__folio" aria-hidden="true">04 <span>/</span> 04<br><small>THE TOP VIEW</small></span>`;
  stage.append(gardenBridge);
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
  const pathFor = (scene, frame) => `images/${SCENES[scene].assetFolder ?? `sequence-${SCENES[scene].folder}`}/${String(frame).padStart(3, "0")}.webp?v=${SCENES[scene].version ?? 2}`;
  // Keep the complete sequence compressed in memory, but decode only nearby frames.
  // This removes network waits during scrolling without retaining 924 decoded images.
  const warmBlobs = new Map();
  const warmFrames = SCENES.flatMap((scene, sceneIndex) =>
    Array.from({ length: scene.count }, (_, frame) => ({ scene: sceneIndex, frame, key: keyFor(sceneIndex, frame) })));
  let warmCursor = 0;
  let warmLoads = 0;
  const MAX_WARM_LOADS = 4;

  function pumpWarm() {
    // The frame currently on screen always wins over background downloads.
    if (activeLoads || queue.length) return;
    while (warmLoads < MAX_WARM_LOADS && warmCursor < warmFrames.length) {
      const { scene, frame, key } = warmFrames[warmCursor++];
      warmLoads++;
      fetch(pathFor(scene, frame), { cache: "force-cache", priority: "low" })
        .then((response) => response.ok ? response.blob() : null)
        .then((blob) => {
          if (blob) warmBlobs.set(key, blob);
          section.dataset.prefetchedFrames = String(warmBlobs.size);
        })
        .catch(() => { /* A visible frame can still load directly if prefetch fails. */ })
        .finally(() => {
          warmLoads--;
          pumpWarm();
        });
    }
  }

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
      let objectUrl = warmBlobs.has(key) ? URL.createObjectURL(warmBlobs.get(key)) : null;
      const releaseUrl = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      };
      cache.set(key, record);
      activeLoads++;
      image.decoding = "async";
      image.onload = async () => {
        try { await image.decode(); } catch (_) { /* onload supplies a usable image */ }
        releaseUrl();
        record.status = "ready";
        activeLoads--;
        trimCache();
        schedule();
        pump();
        pumpWarm();
      };
      image.onerror = () => {
        releaseUrl();
        warmBlobs.delete(key);
        record.status = "failed";
        record.retryAt = Date.now() + 5000;
        activeLoads--;
        trimCache();
        pump();
        pumpWarm();
      };
      image.src = objectUrl || pathFor(scene, frame);
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
    section.classList.toggle("sequence-past-opening", position >= CLUBHOUSE.start - .3);
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

    // The opening sky stays on frame zero until every part of the intro has left.
    // These phases are scroll driven in both directions, with no timed animation.
    const introPosition = position - CLUBHOUSE.start;
    const introReady = cache.get(keyFor(SCENES.indexOf(CLUBHOUSE), 0))?.status === "ready";
    const introArrival = smooth((introPosition + .26) / .38);
    const introDeparture = smooth((introPosition - 1.55) / .45);
    const introVisibility = introReady ? introArrival * (1 - introDeparture) : 0;
    clubhouseIntro.style.visibility = introReady && introPosition > -.26 && position < CLUBHOUSE.playStart ? "visible" : "hidden";
    clubhouseIntro.style.opacity = String(introVisibility);
    clubhouseIntro.style.setProperty("--intro-shade", String(introVisibility));
    clubhouseIntro.setAttribute("aria-hidden", introVisibility < .2 ? "true" : "false");
    introCopy.style.opacity = "1";
    introCopy.style.transform = reducedMotion.matches ? "none"
      : `translate3d(0, ${(1 - introArrival) * 20 - introDeparture * 32}px, 0)`;
    introScroll.style.opacity = String(introReady ? introArrival * (1 - smooth((introPosition - 1.55) / .35)) : 0);
    const viewerPosition = clamp(Math.max(0, introPosition) / 1.8) * introPhotos.length;
    const activePhoto = Math.min(introPhotos.length - 1, Math.floor(viewerPosition));
    const photoBlend = activePhoto < introPhotos.length - 1
      ? smooth((viewerPosition - activePhoto - .62) / .38) : 0;
    introPhotos.forEach((photo, index) => {
      photo.style.zIndex = String(index + 1);
      if (index <= activePhoto) {
        const depth = Math.min(3, activePhoto - index + photoBlend);
        photo.style.opacity = String(Math.max(.6, 1 - depth * .12));
        photo.style.transform = reducedMotion.matches ? "none"
          : `translate3d(${-depth * 16}px, ${-depth * 12}px, 0) rotate(${-depth * 1.4}deg) scale(${1 - depth * .035})`;
      } else if (index === activePhoto + 1) {
        photo.style.opacity = String(photoBlend);
        photo.style.transform = reducedMotion.matches ? "none"
          : `translate3d(${(1 - photoBlend) * 145}px, ${(1 - photoBlend) * 34}px, 0) rotate(${(1 - photoBlend) * 5}deg) scale(${.95 + photoBlend * .05})`;
      } else {
        photo.style.opacity = "0";
        photo.style.transform = "translate3d(145px, 34px, 0) rotate(5deg) scale(.95)";
      }
    });
    introCount.textContent = `${String(activePhoto + (photoBlend >= .5 ? 2 : 1)).padStart(2, "0")} / 04`;
    introSteps.forEach((step, index) => step.style.setProperty("--step-fill", String(clamp(viewerPosition - index))));

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
      caption.style.setProperty("--caption-slide", `${reducedMotion.matches ? 0 : (1 - enterAmount) * 100}%`);
      caption.style.setProperty("--caption-line", String(smooth((position - item.end) / .9)));
      caption.setAttribute("aria-hidden", visibility < .2 ? "true" : "false");
    });
    const bridgeArrival = smooth((position - (CLUBHOUSE.captionExit - .1)) / .5);
    const bridgeDeparture = 1 - smooth((position - ELEVATIONS.start) / .7);
    const bridgeOpacity = bridgeArrival * bridgeDeparture;
    const bridgeWords = smooth((position - (CLUBHOUSE.end + 1.25)) / .4)
      * (1 - smooth((position - (ELEVATIONS.start + .02)) / .43));
    skyBridge.style.setProperty("--bridge-opacity", String(bridgeOpacity));
    skyBridge.style.setProperty("--bridge-words", String(bridgeWords));
    skyBridge.style.setProperty("--bridge-rise", `${reducedMotion.matches ? 0 : (1 - bridgeWords) * 28}px`);
    skyBridge.setAttribute("aria-hidden", bridgeOpacity * bridgeWords < .2 ? "true" : "false");
    const gardenBridgeArrival = smooth((position - (ELEVATIONS.end + .65)) / .4);
    const gardenBridgeDeparture = 1 - smooth((position - GARDENS.start) / .7);
    const gardenBridgeOpacity = gardenBridgeArrival * gardenBridgeDeparture;
    const gardenBridgeWords = smooth((position - (ELEVATIONS.end + .75)) / .4)
      * (1 - smooth((position - (GARDENS.start + .02)) / .43));
    gardenBridge.style.setProperty("--bridge-opacity", String(gardenBridgeOpacity));
    gardenBridge.style.setProperty("--bridge-words", String(gardenBridgeWords));
    gardenBridge.style.setProperty("--bridge-rise", `${reducedMotion.matches ? 0 : (1 - gardenBridgeWords) * 28}px`);
    gardenBridge.setAttribute("aria-hidden", gardenBridgeOpacity * gardenBridgeWords < .2 ? "true" : "false");

    // Let the supporting copy leave first, then part the city name to reveal the film.
    const supportExit = smooth((position - 1.55) / .72);
    const titleSplit = smooth((position - 1.88) / 1.05);
    const titleExit = smooth((position - 2.22) / .72);
    const finalExit = smooth((position - 2.68) / .38);
    const heroOpacity = 1 - (reducedMotion.matches ? smooth((position - 2.05) / .65) : finalExit);
    section.style.setProperty("--hero-opacity", String(heroOpacity));
    section.style.setProperty("--hero-lift", "0px");
    section.style.setProperty("--hero-kicker-opacity", String(1 - supportExit));
    section.style.setProperty("--hero-kicker-y", `${-supportExit * 32}px`);
    section.style.setProperty("--hero-support-opacity", String(1 - supportExit));
    section.style.setProperty("--hero-support-y", `${supportExit * 40}px`);
    section.style.setProperty("--hero-upper-y", `${-titleSplit * 58}px`);
    section.style.setProperty("--hero-lower-y", `${titleSplit * 58}px`);
    section.style.setProperty("--hero-word-scale", String(1 + titleSplit * .08));
    section.style.setProperty("--hero-title-opacity", String(1 - titleExit));
    section.style.setProperty("--hero-tracking", `${titleSplit * .23}em`);
    section.style.setProperty("--shade-opacity", String(1 - smooth((position - 1.72) / 1.25)));
    const inHero = bounds.bottom > stage.clientHeight && bounds.top <= 0;
    nav.classList.toggle("sequence-nav-in-hero", inHero);
    nav.style.setProperty("--sequence-nav-opacity", String(hero.childElementCount ? heroOpacity : 0));
    nav.style.setProperty("--sequence-nav-lift", `${reducedMotion.matches ? 0 : -finalExit * 8}px`);
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
  section.dataset.prefetchedFrames = "0";
  pumpWarm();
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
