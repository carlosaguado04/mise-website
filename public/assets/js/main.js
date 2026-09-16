(() => {
  const root = document.documentElement;
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  if (!location.hash) window.scrollTo(0, 0);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("reduce-motion");

  const prefetched = new Set();
  const prefetch = (href) => {
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (url.hash && url.pathname === location.pathname) return;
      const key = url.pathname;
      if (prefetched.has(key) || key === location.pathname) return;
      prefetched.add(key);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url.href;
      link.as = "document";
      document.head.appendChild(link);
    } catch {}
  };
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    a.addEventListener("pointerenter", () => prefetch(href), { once: true });
    a.addEventListener("focus", () => prefetch(href), { once: true });
  });
  document.querySelectorAll(".primary-nav a[href], .home-hops a[href]").forEach((a) => {
    prefetch(a.getAttribute("href"));
  });
})();
