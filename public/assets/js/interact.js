(() => {
  window.MiseInteract = window.MiseInteract || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pressSel = ".btn, .primary-nav a, .home-hops a, .set-switch button";

  window.MiseInteract.bindPress = function () {
    document.querySelectorAll(pressSel).forEach((el) => {
      if (el.dataset.pressBound) return;
      el.dataset.pressBound = "1";
      el.addEventListener("pointerdown", () => el.classList.add("is-pressed"));
      el.addEventListener("pointerup", () => el.classList.remove("is-pressed"));
      el.addEventListener("pointerleave", () => el.classList.remove("is-pressed"));
      el.addEventListener("pointercancel", () => el.classList.remove("is-pressed"));
    });
  };

  window.MiseInteract.bindAll = function () {
    if (reduce) return;
    window.MiseInteract.bindPress();
  };

  window.MiseInteract.bindAll();
})();
