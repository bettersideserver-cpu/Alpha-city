window.activateShowcaseMedia = function activateShowcaseMedia({ sectionId, videos, activeId }) {
  const section = document.getElementById(sectionId);
  Object.values(videos).forEach((video) => video?.pause());
  const active = videos[activeId];
  if (!section || !active) return () => {};

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) {
      active.pause();
      return;
    }
    if (!active.hasAttribute("src") && active.dataset.src) {
      active.src = active.dataset.src;
      active.preload = "auto";
      active.load();
    }
    active.muted = true;
    active.play().catch(() => {});
  }, { threshold: 0.15 });
  observer.observe(section);

  return () => {
    observer.disconnect();
    active.pause();
  };
};
