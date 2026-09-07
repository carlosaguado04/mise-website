export type FieldHandle = {
  dispose: () => void;
};

type Frame = {
  hx: number;
  hy: number;
  nw: number;
  nh: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotHome: number;
  phase: number;
  freq: number;
  amp: number;
  alpha: number;
  radius: number;
};

type Spec = {
  hx: number;
  hy: number;
  nw: number;
  nh: number;
  alpha: number;
  rot: number;
};

/** Scattered empty frames — a desk, not a lattice, not a wake. */
const SPECS: Spec[] = [
  { hx: 0.06, hy: 0.14, nw: 0.30, nh: 0.22, alpha: 0.62, rot: -1.4 },
  { hx: 0.68, hy: 0.08, nw: 0.20, nh: 0.28, alpha: 0.48, rot: 1.8 },
  { hx: 0.48, hy: 0.66, nw: 0.34, nh: 0.18, alpha: 0.52, rot: -0.6 },
  { hx: 0.40, hy: 0.05, nw: 0.14, nh: 0.11, alpha: 0.34, rot: 2.2 },
  { hx: 0.03, hy: 0.46, nw: 0.13, nh: 0.30, alpha: 0.40, rot: -2.0 },
  { hx: 0.78, hy: 0.40, nw: 0.18, nh: 0.15, alpha: 0.55, rot: 0.8 },
  { hx: 0.16, hy: 0.76, nw: 0.13, nh: 0.11, alpha: 0.30, rot: 1.2 },
  { hx: 0.84, hy: 0.70, nw: 0.14, nh: 0.16, alpha: 0.38, rot: -1.6 },
  { hx: 0.58, hy: 0.36, nw: 0.24, nh: 0.18, alpha: 0.28, rot: 0.4 },
  { hx: 0.26, hy: 0.34, nw: 0.11, nh: 0.09, alpha: 0.32, rot: -0.9 },
  { hx: 0.88, hy: 0.18, nw: 0.10, nh: 0.14, alpha: 0.26, rot: 1.5 },
];

const SPRING = 9.5;
const DAMP = 6.2;
const PULL = 56;
const PULL_R = 260;
const MAX_DT = 1 / 30;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isLightTheme() {
  return document.documentElement.getAttribute("data-theme") === "light";
}

function themePaint() {
  if (isLightTheme()) {
    return { rgb: "168, 201, 0", fill: 0.045, rest: 0.72 };
  }
  return { rgb: "216, 255, 71", fill: 0.028, rest: 1 };
}

function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

export function mountField(canvas: HTMLCanvasElement): FieldHandle {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return { dispose() {} };
  }

  const frames: Frame[] = [];
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, active: false };
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let running = true;
  let lastT = 0;
  let reduced = prefersReducedMotion();
  let paint = themePaint();
  let spanX = 0;
  let spanY = 0;
  let ox = 0;
  let oy = 0;

  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

  function layoutMetrics() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    spanX = Math.min(width, 1320);
    spanY = Math.min(height, 900);
    ox = (width - spanX) / 2;
    oy = (height - spanY) / 2;
  }

  function seed() {
    frames.length = 0;
    const count = width < 720 ? 7 : SPECS.length;
    for (let i = 0; i < count; i += 1) {
      const spec = SPECS[i]!;
      const nw = spec.nw * (width < 720 ? 0.92 : 1);
      const nh = spec.nh * (width < 720 ? 0.9 : 1);
      const fw = Math.max(72, nw * spanX);
      const fh = Math.max(56, nh * spanY);
      const hx = ox + spec.hx * (spanX - fw);
      const hy = oy + spec.hy * (spanY - fh);
      frames.push({
        hx,
        hy,
        nw,
        nh,
        x: hx,
        y: hy,
        vx: 0,
        vy: 0,
        rot: spec.rot,
        rotHome: spec.rot,
        phase: hash(i + 1.7) * Math.PI * 2,
        freq: 0.11 + hash(i + 4.2) * 0.08,
        amp: 10 + hash(i + 8.8) * 16,
        alpha: spec.alpha,
        radius: 12 + Math.min(fw, fh) * 0.04,
      });
    }
  }

  function restPositions() {
    for (let i = 0; i < frames.length; i += 1) {
      const spec = SPECS[i]!;
      const f = frames[i]!;
      const fw = Math.max(72, f.nw * spanX);
      const fh = Math.max(56, f.nh * spanY);
      f.hx = ox + spec.hx * (spanX - fw);
      f.hy = oy + spec.hy * (spanY - fh);
      if (reduced) {
        f.x = f.hx;
        f.y = f.hy;
        f.vx = 0;
        f.vy = 0;
        f.rot = f.rotHome;
      }
    }
  }

  function sizeOf(f: Frame) {
    return {
      w: Math.max(72, f.nw * spanX),
      h: Math.max(56, f.nh * spanY),
    };
  }

  function draw() {
    ctx!.clearRect(0, 0, width, height);
    ctx!.lineJoin = "round";
    ctx!.lineCap = "round";

    for (const f of frames) {
      const { w, h } = sizeOf(f);
      const cx = f.x + w / 2;
      const cy = f.y + h / 2;
      const a = f.alpha * paint.rest;
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate((f.rot * Math.PI) / 180);
      ctx!.beginPath();
      const hw = w / 2;
      const hh = h / 2;
      const r = Math.min(f.radius, hw, hh);
      if (typeof ctx!.roundRect === "function") {
        ctx!.roundRect(-hw, -hh, w, h, r);
      } else {
        ctx!.moveTo(-hw + r, -hh);
        ctx!.lineTo(hw - r, -hh);
        ctx!.quadraticCurveTo(hw, -hh, hw, -hh + r);
        ctx!.lineTo(hw, hh - r);
        ctx!.quadraticCurveTo(hw, hh, hw - r, hh);
        ctx!.lineTo(-hw + r, hh);
        ctx!.quadraticCurveTo(-hw, hh, -hw, hh - r);
        ctx!.lineTo(-hw, -hh + r);
        ctx!.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
        ctx!.closePath();
      }
      ctx!.fillStyle = `rgba(${paint.rgb}, ${paint.fill})`;
      ctx!.fill();
      ctx!.strokeStyle = `rgba(${paint.rgb}, ${a})`;
      ctx!.lineWidth = 1.15;
      ctx!.stroke();
      ctx!.restore();
    }
  }

  function step(now: number) {
    if (!running) return;
    const dt = Math.min(MAX_DT, lastT ? (now - lastT) / 1000 : MAX_DT);
    lastT = now;
    const t = now / 1000;

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    if (!pointer.active) {
      pointer.strength += (0 - pointer.strength) * 0.045;
    }

    for (const f of frames) {
      const { w, h } = sizeOf(f);
      const driftX = Math.sin(t * f.freq + f.phase) * f.amp;
      const driftY = Math.cos(t * f.freq * 0.83 + f.phase * 1.17) * f.amp * 0.72;
      let tx = f.hx + driftX;
      let ty = f.hy + driftY;

      if (pointer.strength > 0.01) {
        const cx = f.x + w / 2;
        const cy = f.y + h / 2;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < PULL_R) {
          const falloff = (1 - dist / PULL_R) ** 2 * pointer.strength;
          tx += (dx / dist) * PULL * falloff;
          ty += (dy / dist) * PULL * falloff;
        }
      }

      const ax = (tx - f.x) * SPRING - f.vx * DAMP;
      const ay = (ty - f.y) * SPRING - f.vy * DAMP;
      f.vx += ax * dt;
      f.vy += ay * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rot = f.rotHome + Math.sin(t * f.freq * 0.55 + f.phase) * 0.7;
    }

    draw();
    raf = requestAnimationFrame(step);
  }

  function startLoop() {
    if (reduced) {
      draw();
      return;
    }
    if (!raf) {
      lastT = 0;
      raf = requestAnimationFrame(step);
    }
  }

  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function onResize() {
    layoutMetrics();
    if (frames.length === 0) seed();
    else restPositions();
    if (reduced) draw();
  }

  function onPointer(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    pointer.active = true;
    pointer.strength = 1;
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  function onVisibility() {
    if (document.hidden) {
      stopLoop();
    } else if (!reduced) {
      startLoop();
    }
  }

  function onMotionChange() {
    reduced = motionMq.matches;
    stopLoop();
    restPositions();
    if (reduced) draw();
    else startLoop();
  }

  function onTheme() {
    paint = themePaint();
    if (reduced) draw();
  }

  const themeObs = new MutationObserver(onTheme);
  themeObs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  layoutMetrics();
  seed();
  if (!reduced && finePointer) {
    pointer.tx = width * 0.55;
    pointer.ty = height * 0.4;
    pointer.x = pointer.tx;
    pointer.y = pointer.ty;
  }
  draw();
  startLoop();

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  motionMq.addEventListener("change", onMotionChange);
  if (finePointer && !reduced) {
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
  }

  return {
    dispose() {
      running = false;
      stopLoop();
      themeObs.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      motionMq.removeEventListener("change", onMotionChange);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onPointerLeave);
    },
  };
}
