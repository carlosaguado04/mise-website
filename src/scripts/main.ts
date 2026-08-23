const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function placeAcid(stage: HTMLElement | null, acid: HTMLElement | null) {
  if (!stage || !acid) return;
  const lit = stage.querySelector<HTMLElement>(
    ".hero-desktop.is-on .hero-window--lit",
  );
  if (!lit) {
    acid.style.opacity = "0";
    return;
  }
  const parent = lit.offsetParent as HTMLElement | null;
  const x = lit.offsetLeft + (parent && parent !== stage ? parent.offsetLeft : 0);
  const y = lit.offsetTop + (parent && parent !== stage ? parent.offsetTop : 0);
  acid.style.width = `${lit.offsetWidth}px`;
  acid.style.height = `${lit.offsetHeight}px`;
  acid.style.left = `${x}px`;
  acid.style.top = `${y}px`;
  acid.style.opacity = "1";
}

const heroStage = document.querySelector<HTMLElement>(".hero-stage");
const heroAcid = document.querySelector<HTMLElement>('[data-acid="hero"]');
const demoStage = document.querySelector<HTMLElement>("[data-demo-stage]");
const demoAcid = document.querySelector<HTMLElement>('[data-acid="demo"]');
const demoDesktops = document.querySelectorAll<HTMLElement>("[data-demo-desktop]");
const cards = document.querySelectorAll<HTMLButtonElement>("[data-set]");
const activeName = document.querySelector<HTMLElement>("[data-demo-active-name]");
const activeChip = document.querySelector<HTMLElement>("[data-demo-active] .key");
const activeExplain = document.querySelector<HTMLElement>("[data-demo-explain]");

function refreshHeroAcid() {
  if (!heroStage || !heroAcid) return;
  if (heroStage.classList.contains("is-empty")) {
    heroAcid.style.opacity = "0";
    return;
  }
  placeAcid(heroStage, heroAcid);
}

function setHeroEmpty(empty: boolean) {
  if (!heroStage) return;
  heroStage.classList.toggle("is-empty", empty);
  if (empty) heroStage.classList.remove("is-clicking");
  requestAnimationFrame(() =>
    requestAnimationFrame(() => refreshHeroAcid()),
  );
}

function pulseHeroClick(): Promise<void> {
  return new Promise((resolve) => {
    if (!heroStage) {
      resolve();
      return;
    }
    heroStage.classList.add("is-clicking");
    window.setTimeout(() => {
      heroStage?.classList.remove("is-clicking");
      resolve();
    }, 900);
  });
}

// Empty wallpaper → click → windows appear. Reduced motion: stay arranged.
if (heroStage) {
  if (reduce) {
    setHeroEmpty(false);
  } else {
    setHeroEmpty(true);
    const emptyMs = 1500;
    const settledMs = 4200;
    const run = async () => {
      await pulseHeroClick();
      setHeroEmpty(false);
      window.setTimeout(() => {
        setHeroEmpty(true);
        window.setTimeout(() => {
          void run();
        }, emptyMs);
      }, settledMs);
    };
    window.setTimeout(() => {
      void run();
    }, emptyMs);
  }
}

requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    refreshHeroAcid();
    placeAcid(demoStage, demoAcid);
  }),
);
window.addEventListener("resize", () => {
  refreshHeroAcid();
  placeAcid(demoStage, demoAcid);
});

const progress = document.querySelector<HTMLElement>(".scroll-progress");
const updateProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
};
updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });

if (!reduce && window.matchMedia("(pointer: fine)").matches) {
  let last = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - last < 28) return;
      last = now;
      const dot = document.createElement("span");
      dot.className = "acid-trail";
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      document.body.append(dot);
      dot.addEventListener("animationend", () => dot.remove());
    },
    { passive: true },
  );
}

if (!reduce) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
  );

  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
      el.style.setProperty("--d", `${i * 60}ms`);
      io.observe(el);
    });
  });

  document
    .querySelectorAll("[data-reveal]:not([data-reveal-group] [data-reveal])")
    .forEach((el) => io.observe(el));

  window.setTimeout(() => {
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
      el.classList.add("is-in");
    });
  }, 2500);
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    if (card.classList.contains("is-active")) return;
    const id = card.dataset.set;
    cards.forEach((c) => {
      const on = c === card;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    demoDesktops.forEach((desk) => {
      desk.classList.toggle("is-on", desk.dataset.demoDesktop === id);
    });
    if (card.dataset.setLabel && demoStage) {
      demoStage.setAttribute("aria-label", card.dataset.setLabel);
    }
    if (activeName && card.dataset.setName) {
      activeName.textContent = card.dataset.setName;
    }
    if (activeChip && card.dataset.setShortcut) {
      activeChip.textContent = card.dataset.setShortcut;
    }
    if (activeExplain && card.dataset.setExplain) {
      activeExplain.textContent = card.dataset.setExplain;
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => placeAcid(demoStage, demoAcid)),
    );
  });
});

const dialog = document.querySelector<HTMLDialogElement>("#demo-dialog");
document.querySelectorAll("[data-open-demo]").forEach((btn) => {
  btn.addEventListener("click", () => dialog?.showModal());
});
document.querySelector("[data-close-demo]")?.addEventListener("click", () => {
  dialog?.close();
});
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const themeButtons = document.querySelectorAll<HTMLButtonElement>("[data-theme-set]");
const themeColorMeta = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("mise-theme", theme);
  } catch {}
  themeButtons.forEach((btn) => {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.themeSet === theme ? "true" : "false",
    );
  });
  const color = theme === "light" ? "#FFFFFF" : "#0C0D10";
  themeColorMeta.forEach((meta) => {
    meta.setAttribute("content", color);
    meta.removeAttribute("media");
  });
}

const initialTheme =
  document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
applyTheme(initialTheme);

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = btn.dataset.themeSet;
    if (next === "light" || next === "dark") applyTheme(next);
  });
});
