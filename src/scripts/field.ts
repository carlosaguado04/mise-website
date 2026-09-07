type Box = { x: number; y: number; w: number; h: number; r: number; a: number };

type SetPoint = { name: string; y: number; el: HTMLElement };

const SETTLE = 0.4;
const TILE_A = 0.7;
const LERP = 0.18;
const FRAME_COUNT = 8;
const GAP = 12;

const SCATTER: Box[] = [
  { x: 0.4, y: 0.05, w: 0.14, h: 0.11, r: 2.2, a: 0.32 },
  { x: 0.16, y: 0.76, w: 0.13, h: 0.11, r: 1.2, a: 0.3 },
  { x: 0.58, y: 0.36, w: 0.24, h: 0.18, r: 0.4, a: 0.28 },
  { x: 0.04, y: 0.46, w: 0.13, h: 0.3, r: -2, a: 0.36 },
  { x: 0.78, y: 0.4, w: 0.18, h: 0.15, r: 0.8, a: 0.5 },
  { x: 0.68, y: 0.08, w: 0.2, h: 0.28, r: 1.8, a: 0.42 },
  { x: 0.06, y: 0.14, w: 0.3, h: 0.22, r: -1.4, a: 0.55 },
  { x: 0.48, y: 0.66, w: 0.34, h: 0.18, r: -0.6, a: 0.48 },
];

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixBox(a: Box, b: Box, t: number): Box {
  return {
    x: mix(a.x, b.x, t),
    y: mix(a.y, b.y, t),
    w: mix(a.w, b.w, t),
    h: mix(a.h, b.h, t),
    r: mix(a.r, b.r, t),
    a: mix(a.a, b.a, t),
  };
}

function copyBox(s: Box): Box {
  return { x: s.x, y: s.y, w: s.w, h: s.h, r: s.r, a: s.a };
}

function pane(x: number, y: number, w: number, h: number, a = TILE_A): Box {
  return { x, y, w, h, r: 0, a };
}

function hide(into: Box): Box {
  return { x: into.x, y: into.y, w: into.w, h: into.h, r: 0, a: 0 };
}

/** Compact centered desk. Outer edge is one rectangle. */
function monitor(vw: number, vh: number): { x: number; y: number; w: number; h: number } {
  const w = Math.round(Math.min(vw - 40, 1120));
  const h = Math.round(Math.min(vh - 108, 660));
  const x = Math.round((vw - w) / 2);
  const y = Math.max(80, Math.round((vh - h) / 2));
  return { x, y, w, h };
}

/** Split a rectangle; gutters sit inside so the union stays flush. */
function split(
  rect: { x: number; y: number; w: number; h: number },
  weights: number[],
  axis: "x" | "y",
  gap = 0,
) {
  const n = weights.length;
  const size = axis === "x" ? rect.w : rect.h;
  const inner = size - gap * Math.max(0, n - 1);
  const sum = weights.reduce((n, w) => n + w, 0);
  const out: { x: number; y: number; w: number; h: number }[] = [];
  let cursor = axis === "x" ? rect.x : rect.y;
  const end = axis === "x" ? rect.x + rect.w : rect.y + rect.h;
  for (let i = 0; i < n; i += 1) {
    const last = i === n - 1;
    const dim = last ? end - cursor : Math.round((inner * weights[i]!) / sum);
    out.push(
      axis === "x"
        ? { x: cursor, y: rect.y, w: dim, h: rect.h }
        : { x: rect.x, y: cursor, w: rect.w, h: dim },
    );
    cursor += dim + (last ? 0 : gap);
  }
  return out;
}

function scatterPx(vw: number, vh: number): Box[] {
  return SCATTER.map((s) => ({
    x: s.x * vw,
    y: s.y * vh,
    w: s.w * vw,
    h: s.h * vh,
    r: s.r,
    a: s.a,
  }));
}

function assign(visible: Box[], at: number[]): Box[] {
  const fallback = visible[0]!;
  const frames: Box[] = [];
  for (let i = 0; i < FRAME_COUNT; i += 1) {
    const idx = at[i] ?? -1;
    const box = idx >= 0 ? visible[idx] : undefined;
    frames.push(box ? copyBox(box) : hide(fallback));
  }
  return frames;
}

function asPanes(parts: { x: number; y: number; w: number; h: number }[]) {
  return assign(
    parts.map((p) => pane(p.x, p.y, p.w, p.h)),
    parts.map((_, i) => i),
  );
}

/** Two equal columns. */
function layoutPair(vw: number, vh: number): Box[] {
  const m = monitor(vw, vh);
  if (vw < 720) return asPanes(split(m, [1, 1], "y", GAP));
  return asPanes(split(m, [1, 1], "x", GAP));
}

/** Title across the top, two cards below. */
function layoutT(vw: number, vh: number, title = 30, cards: number[] = [1, 1]): Box[] {
  const m = monitor(vw, vh);
  const [top, bot] = split(m, [title, 100 - title], "y", GAP);
  if (vw < 720) {
    return asPanes([top!, ...split(bot!, cards, "y", GAP)]);
  }
  return asPanes([top!, ...split(bot!, cards, "x", GAP)]);
}

/** Three columns, full height. */
function layoutCols(vw: number, vh: number): Box[] {
  const m = monitor(vw, vh);
  if (vw < 720) return asPanes(split(m, [26, 37, 37], "y", GAP));
  return asPanes(split(m, [30, 35, 35], "x", GAP));
}

/** Title left, two stacked cards on the right. */
function layoutLeft(vw: number, vh: number): Box[] {
  const m = monitor(vw, vh);
  if (vw < 720) return layoutT(vw, vh, 28);
  const [left, right] = split(m, [38, 62], "x", GAP);
  return asPanes([left!, ...split(right!, [1, 1], "y", GAP)]);
}

function layoutFocus(vw: number, vh: number): Box[] {
  return asPanes([monitor(vw, vh)]);
}

function uniquePanes(boxes: Box[]): Box[] {
  const panes: Box[] = [];
  for (const b of boxes) {
    if (b.a < 0.12 || b.w < 12 || b.h < 12) continue;
    const dup = panes.some(
      (p) =>
        Math.abs(p.x - b.x) < 1.5 &&
        Math.abs(p.y - b.y) < 1.5 &&
        Math.abs(p.w - b.w) < 1.5 &&
        Math.abs(p.h - b.h) < 1.5,
    );
    if (!dup) panes.push(copyBox(b));
  }
  panes.sort((a, b) => a.y - b.y || a.x - b.x);
  return panes;
}

function bindSlots(slots: HTMLElement[], panes: Box[]) {
  if (!panes.length || !slots.length) return [] as { el: HTMLElement; box: Box }[];
  const groups = panes.map((box) => ({ els: [] as HTMLElement[], box }));
  slots.forEach((el, i) => {
    groups[Math.min(i, groups.length - 1)]!.els.push(el);
  });
  const placed: { el: HTMLElement; box: Box }[] = [];
  for (const group of groups) {
    if (!group.els.length) continue;
    if (group.els.length === 1) {
      placed.push({ el: group.els[0]!, box: group.box });
      continue;
    }
    const parts = split(group.box, group.els.map(() => 1), "y", GAP);
    group.els.forEach((el, i) => {
      const part = parts[i]!;
      placed.push({ el, box: pane(part.x, part.y, part.w, part.h) });
    });
  }
  return placed;
}

function boxesFor(name: string, vw: number, vh: number): Box[] {
  switch (name) {
    case "pair":
      return layoutPair(vw, vh);
    case "dev":
      return layoutT(vw, vh, 28);
    case "split":
      return layoutCols(vw, vh);
    case "write":
      return layoutT(vw, vh, 22, [44, 56]);
    case "focus":
      return layoutFocus(vw, vh);
    default:
      return scatterPx(vw, vh);
  }
}

export function mountField(wrap: HTMLElement) {
  const frames = [...wrap.querySelectorAll<HTMLElement>(".field-frame")];
  if (!frames.length) return;

  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const vw0 = wrap.clientWidth || window.innerWidth;
  const vh0 = wrap.clientHeight || window.innerHeight;
  const current = scatterPx(vw0, vh0);
  const target = scatterPx(vw0, vh0);

  let points: SetPoint[] = [];
  let raf = 0;
  let dirty = true;
  let locked = false;
  let activeIndex = 0;
  let lastHere: HTMLElement | null = null;
  let appearAt = 0;

  function reduced() {
    return motionMq.matches;
  }

  function size() {
    return {
      vw: wrap.clientWidth || window.innerWidth,
      vh: wrap.clientHeight || window.innerHeight,
    };
  }

  const allSlots = [...document.querySelectorAll<HTMLElement>("[data-slot]")];
  const footer = document.querySelector<HTMLElement>(".footer");

  function measure() {
    points = [...document.querySelectorAll<HTMLElement>("[data-field-set]")].map((el) => ({
      name: el.dataset.fieldSet || "scatter",
      y: el.getBoundingClientRect().top + window.scrollY,
      el,
    }));
    if (!points.length) {
      points = [{ name: "scatter", y: 0, el: wrap }];
    }
  }

  function retarget() {
    const { vw, vh } = size();
    if (!points.length) measure();
    const cursor = window.scrollY + window.innerHeight * 0.5;
    let i = 0;
    for (let n = 1; n < points.length; n += 1) {
      if (points[n]!.y <= cursor) i = n;
    }
    activeIndex = i;
    const here = points[i]!;
    boxesFor(here.name, vw, vh).forEach((box, idx) => {
      target[idx] = copyBox(box);
    });
  }

  function write() {
    for (let i = 0; i < frames.length; i += 1) {
      const frame = frames[i]!;
      const s = current[i]!;
      frame.style.left = "0px";
      frame.style.top = "0px";
      frame.style.width = `${Math.round(s.w)}px`;
      frame.style.height = `${Math.round(s.h)}px`;
      frame.style.rotate = "0deg";
      frame.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(s.y)}px, 0) rotate(${s.r.toFixed(2)}deg)`;
      frame.style.setProperty("--a", s.a.toFixed(3));
      frame.style.zIndex = String(i);
    }
    stageContent();
  }

  function clearSlot(el: HTMLElement) {
    el.classList.remove("is-slotted", "is-parked");
    el.style.position = "";
    el.style.left = "";
    el.style.top = "";
    el.style.width = "";
    el.style.height = "";
    el.style.zIndex = "";
    el.style.margin = "";
    el.style.maxWidth = "";
  }

  function placeSlot(el: HTMLElement, box: Box, parked: boolean) {
    el.classList.add("is-slotted");
    el.style.setProperty("--park-i", String(el.dataset.parkI ?? "0"));
    el.classList.toggle("is-parked", parked);
    el.style.position = "fixed";
    el.style.left = `${Math.round(box.x)}px`;
    el.style.top = `${Math.round(box.y)}px`;
    el.style.width = `${Math.round(box.w)}px`;
    el.style.height = `${Math.round(box.h)}px`;
    el.style.zIndex = "4";
    el.style.margin = "0";
    el.style.maxWidth = "none";
  }

  function stageContent() {
    const staging = !reduced() && allSlots.length > 0;
    document.documentElement.classList.toggle("is-staging", staging);
    document.documentElement.classList.toggle("is-desk", staging && !scatterish());

    if (!staging) {
      allSlots.forEach(clearSlot);
      return;
    }

    const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
    const footerIn = footerTop < window.innerHeight * 0.82;
    const here = points[activeIndex];
    if (here?.el && here.el !== lastHere) {
      lastHere = here.el;
      appearAt = performance.now();
    }
    const { vw, vh } = size();
    const desk = here && here.name !== "scatter" ? uniquePanes(boxesFor(here.name, vw, vh)) : [];
    const slots = here ? [...here.el.querySelectorAll<HTMLElement>("[data-slot]")] : [];
    const ready = !footerIn && !scatterish() && here?.name !== "scatter";
    const placed = ready && desk.length && slots.length ? bindSlots(slots, desk) : [];
    const elapsed = performance.now() - appearAt;
    const parked = new Set<HTMLElement>();

    placed.forEach(({ el, box }, i) => {
      el.dataset.parkI = String(i);
      const byTime = elapsed >= 50 + i * 90;
      const already = el.classList.contains("is-slotted");
      placeSlot(el, box, already && byTime);
      parked.add(el);
    });

    allSlots.forEach((el) => {
      if (!parked.has(el)) clearSlot(el);
    });
  }

  function near(a: Box, b: Box) {
    return (
      Math.abs(a.x - b.x) < SETTLE &&
      Math.abs(a.y - b.y) < SETTLE &&
      Math.abs(a.w - b.w) < SETTLE &&
      Math.abs(a.h - b.h) < SETTLE &&
      Math.abs(a.r - b.r) < 0.05 &&
      Math.abs(a.a - b.a) < 0.01
    );
  }

  function scatterish() {
    return points[activeIndex]?.name === "scatter";
  }

  function setLocked(next: boolean) {
    if (locked === next) return;
    locked = next;
    wrap.classList.toggle("is-locked", next);
  }

  function tick() {
    if (dirty) {
      measure();
      retarget();
      dirty = false;
    }

    if (reduced()) {
      for (let i = 0; i < current.length; i += 1) current[i] = copyBox(target[i]!);
      write();
      setLocked(!scatterish());
      raf = 0;
      return;
    }

    let settled = true;
    for (let i = 0; i < current.length; i += 1) {
      const c = current[i]!;
      const g = target[i]!;
      if (near(c, g)) {
        current[i] = copyBox(g);
        continue;
      }
      settled = false;
      current[i] = mixBox(c, g, LERP);
    }

    write();
    setLocked(!(settled && scatterish()));

    const appearing = performance.now() < appearAt + 900;
    if (settled && !dirty && !appearing) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    dirty = true;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function onResize() {
    measure();
    retarget();
    for (let i = 0; i < current.length; i += 1) current[i] = copyBox(target[i]!);
    write();
    setLocked(!scatterish());
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else start();
  }

  if (!reduced()) {
    document.querySelectorAll<HTMLElement>("[data-stage]").forEach((el) => {
      el.style.minHeight = "100svh";
      el.style.height = "100svh";
    });
  }

  measure();
  retarget();
  if (reduced()) {
    for (let i = 0; i < current.length; i += 1) current[i] = copyBox(target[i]!);
  }
  write();
  setLocked(!scatterish());

  window.addEventListener("scroll", start, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  motionMq.addEventListener("change", start);
}