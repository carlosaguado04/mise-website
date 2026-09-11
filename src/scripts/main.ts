import { mountField } from "./field";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const field = document.querySelector<HTMLElement>(".field-wrap");
if (field) mountField(field);

try {
  localStorage.removeItem("mise-theme");
} catch {}

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
