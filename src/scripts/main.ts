import { mountField } from "./field";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const field = document.querySelector<HTMLElement>(".field-wrap");
if (field) mountField(field);

const header = document.querySelector<HTMLElement>(".site-header");
const nav = document.getElementById("site-nav");
const navToggle = document.getElementById("nav-toggle");
const navLabel = navToggle?.querySelector("[data-nav-label]");
let lastNavFocus: HTMLElement | null = null;

function setNavOpen(open: boolean) {
  const wasOpen = document.body.classList.contains("is-nav-open");
  document.body.classList.toggle("is-nav-open", open);
  header?.classList.toggle("is-nav-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  navToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (navLabel) navLabel.textContent = open ? "Close" : "Menu";
  if (nav instanceof HTMLElement) {
    nav.classList.toggle("is-open", open);
    nav.inert = !open;
    if (open) nav.removeAttribute("inert");
    else nav.setAttribute("inert", "");
    nav.setAttribute("aria-hidden", String(!open));
  }
  if (open) {
    lastNavFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : navToggle;
    const first = nav?.querySelector<HTMLElement>("a[href]");
    first?.focus();
  } else if (wasOpen) {
    lastNavFocus?.focus();
    lastNavFocus = null;
  }
}

if (nav instanceof HTMLElement) {
  nav.inert = true;
  nav.setAttribute("inert", "");
  nav.setAttribute("aria-hidden", "true");
}

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  setNavOpen(open);
});

nav?.addEventListener("click", (event) => {
  if ((event.target as Element | null)?.closest?.("a[href]")) setNavOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNavOpen(false);
  if (event.key !== "Tab" || !document.body.classList.contains("is-nav-open")) return;
  const roots = [header, nav].filter((el): el is HTMLElement => el instanceof HTMLElement);
  const nodes = roots.flatMap((rootEl) =>
    [...rootEl.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
      (el) => !el.closest("[inert]") && el.tabIndex !== -1,
    ),
  );
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const progress = document.querySelector<HTMLElement>(".scroll-progress-bar");
const updateProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
};
updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });

splitSubs();

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

  const revealSel = "[data-reveal], [data-sub]";

  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll<HTMLElement>(revealSel).forEach((el, i) => {
      el.style.setProperty("--d", `${i * 60}ms`);
      io.observe(el);
    });
  });

  document
    .querySelectorAll("[data-reveal]:not([data-reveal-group] [data-reveal])")
    .forEach((el) => io.observe(el));
  document
    .querySelectorAll("[data-sub]:not([data-reveal-group] [data-sub])")
    .forEach((el) => io.observe(el));

  window.setTimeout(() => {
    document.querySelectorAll(`${revealSel}:not(.is-in)`).forEach((el) => {
      el.classList.add("is-in");
    });
  }, 2500);
}

function splitSubs() {
  document.querySelectorAll<HTMLElement>("[data-sub]").forEach((el) => {
    if (el.querySelector(".sub-word")) return;
    const nodes = [...el.childNodes];
    const frag = document.createDocumentFragment();
    let i = 0;

    const pushWord = (word: string) => {
      const outer = document.createElement("span");
      outer.className = "sub-word";
      outer.style.setProperty("--i", String(i));
      i += 1;
      const inner = document.createElement("span");
      inner.textContent = word;
      outer.append(inner);
      frag.append(outer);
    };

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const part of (node.textContent ?? "").split(/(\s+)/)) {
          const word = part.trim();
          if (word) pushWord(word);
        }
        continue;
      }
      if (node instanceof HTMLElement) {
        const outer = document.createElement("span");
        outer.className = "sub-word";
        outer.style.setProperty("--i", String(i));
        i += 1;
        const inner = document.createElement("span");
        inner.append(node);
        outer.append(inner);
        frag.append(outer);
      }
    }

    if (i) el.replaceChildren(frag);
  });
}

const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");
const themeColorMeta = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("mise-theme", theme);
  } catch {}
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }
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

themeToggle?.addEventListener("click", () => {
  const next =
    document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
});

const mascotLines = [
  "Wow. Clicking the mascot. Peak productivity.",
  "Your windows aren’t lost. You’re just bad at filing.",
  "mise en place: French for ‘stop living like a raccoon.’",
  "I move rectangles for a living. What’s your excuse?",
  "Yes, I saw that 47-tab Safari. No, we won’t discuss it.",
  "One Set and you’d look like you have a personality.",
  "I’m decorative until you click me. Now I’m judgmental.",
  "⌃⌥1. Or keep dragging windows like it’s 2009. Your call.",
];

const mascotBtn = document.querySelector<HTMLButtonElement>("[data-mascot]");
const mascotBubble = document.querySelector<HTMLElement>("[data-mascot-bubble]");
let mascotLine = 0;
let mascotHide: number | undefined;

mascotBtn?.addEventListener("click", () => {
  if (!mascotBubble) return;
  mascotBubble.hidden = false;
  mascotBubble.textContent = mascotLines[mascotLine % mascotLines.length] ?? "";
  mascotLine += 1;
  mascotBubble.style.animation = "none";
  void mascotBubble.offsetWidth;
  mascotBubble.style.animation = "";
  window.clearTimeout(mascotHide);
  mascotHide = window.setTimeout(() => {
    mascotBubble.hidden = true;
  }, 3200);
});
