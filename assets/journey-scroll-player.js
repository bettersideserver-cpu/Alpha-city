window.setupJourneyScroll = function setupJourneyScroll({
  section, videos, layers, captions, bars, shade, takeover, setActive,
}) {
  if (!section || videos.length === 0) return () => {};

  const count = videos.length;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };
  const playbackEnd = 0.88;
  const pending = new Array(count).fill(null);
  const seeking = new Array(count).fill(false);
  const loaded = new Array(count).fill(false);
  let frame = 0;
  let currentScene = -1;
  let disposed = false;

  function loadClip(index) {
    const video = videos[index];
    if (!video || loaded[index]) return;
    loaded[index] = true;
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
    });
    video.preload = "auto";
    video.load();
  }

  function seek(index, fraction) {
    const video = videos[index];
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    // The last decodable frame is just before duration; seeking to duration can clear the image.
    const end = Math.max(0, video.duration - 1 / 30);
    const target = end * clamp(fraction);
    if (Math.abs(video.currentTime - target) < 1 / 30) return;
    if (seeking[index]) {
      pending[index] = target;
      return;
    }
    seeking[index] = true;
    try {
      video.currentTime = target;
    } catch (_) {
      seeking[index] = false;
    }
  }

  function onSeeked(index) {
    return () => {
      seeking[index] = false;
      const target = pending[index];
      pending[index] = null;
      if (target !== null && !disposed) seek(index, target / Math.max(0.001, videos[index].duration - 1 / 30));
    };
  }
  function seekedFor(index) {
    return seeked[index];
  }
  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(update);
  }

  function update() {
    frame = 0;
    if (disposed) return;
    const bounds = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    const raw = clamp(-bounds.top / travel);
    const position = Math.min(count - 0.000001, raw * count);
    const scene = Math.floor(position);
    const local = position - scene;
    const movieProgress = clamp(local / playbackEnd);
    const blend = scene < count - 1 ? smooth((local - playbackEnd) / (1 - playbackEnd)) : 0;

    if (scene !== currentScene) {
      currentScene = scene;
      setActive(scene);
    }
    const nearSection = bounds.top <= window.innerHeight * 0.3 && bounds.bottom > 0;
    if (nearSection) {
      loadClip(scene);
      // Prepare only the following clip as the current one reaches its end.
      if (scene < count - 1 && local >= 0.8) loadClip(scene + 1);
      seek(scene, movieProgress);
      if (scene < count - 1 && local >= playbackEnd) seek(scene + 1, 0);
    }

    layers.forEach((layer, index) => {
      if (!layer) return;
      const opacity = index === scene ? 1 - blend : index === scene + 1 ? blend : 0;
      layer.style.transition = "none";
      layer.style.visibility = opacity > 0 ? "visible" : "hidden";
      layer.style.opacity = String(opacity);
      layer.style.transform = "scale(1)";
      layer.style.filter = "none";
    });
    captions.forEach((caption, index) => {
      if (!caption) return;
      const opacity = index === scene ? 1 - blend : index === scene + 1 ? blend : 0;
      caption.style.transition = "none";
      caption.style.visibility = opacity > 0 ? "visible" : "hidden";
      caption.style.opacity = String(opacity);
      caption.style.transform = `translateY(${((1 - opacity) * 18).toFixed(1)}px)`;
    });
    bars.forEach((bar, index) => {
      if (!bar) return;
      const progress = index < scene ? 1 : index === scene ? movieProgress : 0;
      bar.style.transform = `scaleY(${progress.toFixed(3)})`;
    });
    if (shade) shade.style.opacity = "0";

    if (takeover) {
      const rise = scene === count - 1 ? smooth((local - playbackEnd) / (1 - playbackEnd)) : 0;
      const curve = (1 - rise) * 72;
      takeover.style.transform = `translate3d(0,${((1 - rise) * 100).toFixed(2)}%,0)`;
      takeover.style.visibility = rise > 0.001 ? "visible" : "hidden";
      takeover.style.borderRadius = `50% 50% 0 0 / ${curve.toFixed(1)}px ${curve.toFixed(1)}px 0 0`;
    }
  }

  // Keep one listener per video so rapid scrolling only decodes the newest requested frame.
  const seeked = videos.map((_, index) => onSeeked(index));
  videos.forEach((video, index) => {
    if (!video) return;
    video.pause();
    video.muted = true;
    video.preload = "none";
    video.addEventListener("seeked", seeked[index]);
    video.addEventListener("loadedmetadata", schedule);
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    videos.forEach((video, index) => {
      if (!video) return;
      video.removeEventListener("seeked", seekedFor(index));
      video.removeEventListener("loadedmetadata", schedule);
      video.pause();
    });
  };
};
