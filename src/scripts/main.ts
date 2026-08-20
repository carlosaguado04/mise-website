const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const figure = shot?.closest(".demo-shot");

function swapShot(card: HTMLButtonElement) {
  if (!shot) return;
  const next = card.dataset.src;
  const nextAlt = card.dataset.alt;
  if (nextAlt) shot.alt = nextAlt;
  if (!next || shot.getAttribute("src") === next) return;

  if (reduce) {
    shot.src = next;
    return;
  }

  let done = false;
  const apply = () => {
    if (done) return;
    done = true;
    shot.src = next;
    figure?.classList.remove("is-fading");
  };

  figure?.classList.add("is-fading");
  shot.addEventListener("transitionend", apply, { once: true });
  window.setTimeout(apply, 220);
}

function pulse(card: HTMLButtonElement) {
  if (reduce) return;
  card.classList.remove("is-pulsing");
  void card.offsetWidth;
  card.classList.add("is-pulsing");
  const onEnd = (event: AnimationEvent) => {
    if (event.animationName !== "set-pulse") return;
    card.classList.remove("is-pulsing");
    card.removeEventListener("animationend", onEnd);
  };
  card.addEventListener("animationend", onEnd);
}

cards.forEach((card) => {
  const src = card.dataset.src;
  if (src) {
    const preload = new Image();
    preload.src = src;
  }

  card.addEventListener("click", () => {
    cards.forEach((c) => {
      const on = c === card;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    pulse(card);
    swapShot(card);
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
