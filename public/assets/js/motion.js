(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layouts = ["laptop", "desk", "focus"];

  const bindField = () => {
    const cluster = document.querySelector("[data-cluster]");
    const buttons = [...document.querySelectorAll("[data-set]")];
    if (!cluster || !buttons.length) return;

    let idx = layouts.indexOf(cluster.getAttribute("data-layout") || "laptop");
    if (idx < 0) idx = 0;
    let timer = 0;
    let paused = false;

    const apply = (next) => {
      idx = next;
      const id = layouts[idx];
      cluster.setAttribute("data-layout", id);
      buttons.forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-set") === id ? "true" : "false");
      });
    };

    const tick = () => {
      if (paused || reduce) return;
      apply((idx + 1) % layouts.length);
    };

    const arm = () => {
      window.clearInterval(timer);
      if (reduce) return;
      timer = window.setInterval(tick, 4200);
    };

    buttons.forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-set");
        const next = layouts.indexOf(id);
        if (next < 0) return;
        apply(next);
        arm();
      });
    });

    const field = document.querySelector("[data-field]");
    field?.addEventListener("pointerenter", () => { paused = true; });
    field?.addEventListener("pointerleave", () => { paused = false; });

    arm();
  };

  const kill = () => {
    if (typeof gsap === "undefined") return;
    try {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    } catch {}
    try {
      gsap.killTweensOf(".wordmark, .hero-line, .hero-sub, .frame, .set-switch, .home-cta, .beat, [data-unlock-panel], .unlock-lead");
    } catch {}
  };

  const initHome = ({ soft = false } = {}) => {
    const home = document.querySelector("[data-home]");
    if (!home) return;
    const mark = home.querySelector(".wordmark");
    const line = home.querySelector(".hero-line");
    const sub = home.querySelector(".hero-sub");
    const frames = [...home.querySelectorAll(".frame")].filter(
      (f) => f.getAttribute("data-slot") !== "c"
    );
    const names = home.querySelector(".set-switch");
    const cta = home.querySelector(".home-cta");

    if (reduce || typeof gsap === "undefined") {
      home.classList.add("is-ready");
      bindField();
      return;
    }

    if (soft) {
      gsap.set(mark, { autoAlpha: 1, y: 0 });
      gsap.set([line, sub], { autoAlpha: 1, y: 0 });
      gsap.set(frames, { autoAlpha: 0, y: 18, scale: 0.96 });
      gsap.set(names, { autoAlpha: 0 });
      gsap.set(cta, { autoAlpha: 0, y: 10 });
      home.classList.add("is-ready");
      gsap.to(frames, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.05,
      });
      gsap.to(names, { autoAlpha: 1, duration: 0.5, delay: 0.28, ease: "power2.out" });
      gsap.to(cta, { autoAlpha: 1, y: 0, duration: 0.55, delay: 0.34, ease: "power3.out" });
      bindField();
      return;
    }

    gsap.set(mark, { autoAlpha: 1, y: 14 });
    gsap.set([line, sub], { autoAlpha: 0, y: 10 });
    gsap.set(frames, { autoAlpha: 0, y: 22, scale: 0.94 });
    gsap.set(names, { autoAlpha: 0 });
    gsap.set(cta, { autoAlpha: 0, y: 12 });
    home.classList.add("is-ready");

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(mark, { y: 0, duration: 0.7 });
    tl.to([line, sub], { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, "-=0.4");
    tl.to(frames, { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.09 }, "-=0.1");
    tl.to(names, { autoAlpha: 1, duration: 0.4 }, "-=0.35");
    tl.to(cta, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.22");
    tl.add(() => bindField());
  };

  const initFeatures = ({ soft = false } = {}) => {
    const story = document.querySelector("[data-story]");
    if (!story) return;
    const beats = [...story.querySelectorAll("[data-beat]")];
    const rails = [...story.querySelectorAll("[data-rail]")];
    const beatsWrap = story.querySelector(".story-beats");
    const title = document.querySelector(".page-features .page-title");

    const setActive = (id) => {
      rails.forEach((a) => a.classList.toggle("is-active", a.getAttribute("data-rail") === id));
    };

    if (reduce || typeof gsap === "undefined") {
      beatsWrap?.classList.add("is-ready");
      beats[0] && setActive(beats[0].getAttribute("data-beat"));
      beats.forEach((b) => b.classList.add("is-in"));
      return;
    }

    beatsWrap?.classList.add("is-ready");
    if (title && !soft) {
      gsap.fromTo(title, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" });
    }
    if (soft) {
      const body = gsap.utils.toArray(".page-kicker, .story-rail, .story-beats");
      if (body.length) {
        gsap.fromTo(
          body,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.04 }
        );
      }
    }

    beats.forEach((beat) => {
      const id = beat.getAttribute("data-beat");
      ScrollTrigger.create({
        trigger: beat,
        start: "top 72%",
        onEnter: () => {
          beat.classList.add("is-in");
        },
        onEnterBack: () => beat.classList.add("is-in"),
      });
      ScrollTrigger.create({
        trigger: beat,
        start: "top 40%",
        end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) setActive(id);
        },
      });
    });

    if (!beats.length) return;
    const first = beats[0];
    const top = first.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.85) {
      first.classList.add("is-in");
      setActive(first.getAttribute("data-beat"));
    }
  };

  const initPro = ({ soft = false } = {}) => {
    const unlock = document.querySelector("[data-unlock]");
    if (!unlock) return;
    const panels = [...unlock.querySelectorAll("[data-unlock-panel]")];
    const lead = document.querySelector("[data-unlock-lead]");
    const title = document.querySelector(".page-pro .page-title");

    if (reduce || typeof gsap === "undefined") {
      unlock.classList.add("is-ready");
      return;
    }

    gsap.set(panels, { autoAlpha: 0 });
    if (lead) gsap.set(lead, { autoAlpha: 0, y: 10 });
    unlock.classList.add("is-ready");
    if (title && !soft) {
      gsap.fromTo(title, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" });
    }
    if (soft) {
      const extra = gsap.utils.toArray(".page-kicker, .unlock-note, .pro-download");
      if (extra.length) {
        gsap.fromTo(
          extra,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.04 }
        );
      }
    }
    if (lead) gsap.to(lead, { autoAlpha: 1, y: 0, duration: 0.55, delay: soft ? 0.05 : 0.08, ease: "power3.out" });
    gsap.to(panels, {
      autoAlpha: 1,
      duration: 0.7,
      stagger: 0.12,
      delay: soft ? 0.1 : 0.16,
      ease: "power3.out",
    });
  };

  const init = ({ soft = false } = {}) => {
    if (typeof gsap !== "undefined") {
      try { gsap.registerPlugin(ScrollTrigger); } catch {}
    }
    kill();
    initHome({ soft });
    initFeatures({ soft });
    initPro({ soft });
  };

  window.MiseMotion = { init, kill };

  const waitMs = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const warmHtml = (path) =>
    fetch(path, { headers: { Accept: "text/html" }, credentials: "same-origin" })
      .then((r) => r.text())
      .catch(() => "");

  const finishBoot = async () => {
    const isHome = document.body.classList.contains("page-home");
    const home = document.querySelector("[data-home]");
    const booting = document.body.classList.contains("is-booting");

    if (!(isHome && home && booting)) {
      document.body.classList.remove("is-booting");
      document.documentElement.classList.remove("is-booting");
      init({ soft: false });
      return;
    }

    document.documentElement.classList.add("is-booting");
    try {
      const fonts =
        document.fonts && document.fonts.ready
          ? Promise.race([document.fonts.ready, waitMs(1600)])
          : Promise.resolve();
      await Promise.all([fonts, warmHtml("/features"), warmHtml("/pro")]);
      await waitPaint();
    } catch {}

    document.body.classList.remove("is-booting");
    document.documentElement.classList.remove("is-booting");
    await waitPaint();
    init({ soft: false });
  };

  if (typeof gsap === "undefined") {
    document.body.classList.remove("is-booting");
    document.documentElement.classList.remove("is-booting");
    document.querySelector("[data-home]")?.classList.add("is-ready");
    document.querySelector(".story-beats")?.classList.add("is-ready");
    document.querySelector("[data-unlock]")?.classList.add("is-ready");
    bindField();
    window.MiseMotion = { init() {}, kill() {} };
    return;
  }

  finishBoot();
})();
