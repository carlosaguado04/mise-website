const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const desktops = document.querySelectorAll<HTMLElement>(".hero-desktop");
if (!reduce && desktops.length > 1) {
  let i = 0;
  window.setInterval(() => {
    i = (i + 1) % desktops.length;
    desktops.forEach((el, j) => el.classList.toggle("is-on", j === i));
  }, 5600);
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

const shot = document.querySelector<HTMLImageElement>("[data-demo-shot]");
const cards = document.querySelectorAll<HTMLButtonElement>("[data-set]");
const preloaded = new Map<string, HTMLImageElement>();

cards.forEach((card) => {
  const src = card.dataset.src;
  if (src) {
    const img = new Image();
    img.src = src;
    img.decode?.().catch(() => {});
    preloaded.set(src, img);
  }

  card.addEventListener("click", () => {
    if (card.classList.contains("is-active")) return;
    cards.forEach((c) => {
      const on = c === card;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    void swapShot(card);
  });
});

async function swapShot(card: HTMLButtonElement) {
  if (!shot) return;
  const next = card.dataset.src;
  const nextAlt = card.dataset.alt;
  if (nextAlt) shot.alt = nextAlt;
  if (!next || shot.getAttribute("src") === next) return;

  const ready = preloaded.get(next);
  if (ready) {
    try {
      await ready.decode();
    } catch {
      /* already cached or decode unsupported */
    }
  }
  shot.src = next;
}

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
