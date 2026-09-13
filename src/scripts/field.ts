export function mountField(wrap: HTMLElement) {
  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => wrap.classList.toggle("is-locked", motionMq.matches);
  sync();
  motionMq.addEventListener("change", sync);
}
