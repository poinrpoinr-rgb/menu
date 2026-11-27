// صمام أمان للمتصفحات الداخلية (إنستغرام / تيليغرام)
setTimeout(() => {
  const el = document.getElementById("loader");
  if (el) el.remove();
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
}, 2500);

/* ========== شاشة التحميل السريعة + تسجيل PWA (TAZA 041) ========== */
const Loader = (() => {
  const MIN_DURATION = 950;
  const MAX_WAIT = 2000;
  const ZOOM_DURATION = 650;
  const OPEN_AT = 0.65;

  const el = document.getElementById("loader");
  const fill = document.getElementById("loaderFill");
  const percent = document.getElementById("loaderPercent");

  let pageLoaded = document.readyState !== "loading";
  document.addEventListener("DOMContentLoaded", () => (pageLoaded = true));
  window.addEventListener("load", () => (pageLoaded = true));

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  let finished = false;

  function setProgress(p) {
    if (fill) fill.style.transform = `scaleX(${p / 100})`;
    if (percent) percent.textContent = `${Math.round(p)}%`;
  }

  function openSite() {
    if (el) {
      el.classList.add("done");
      el.addEventListener("transitionend", (e) => e.target === el && el.remove(), { once: false });
      setTimeout(() => el.isConnected && el.remove(), 1200);
    }
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  }

 function zoomIntoPlate() {
    const isLowEnd =
      (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
      window.innerWidth <= 768;
    if (!el || isLowEnd) return false;

    const svg = el.querySelector(".cloche");
    const plate = document.getElementById("plate");
    if (!svg || !plate) return false;

    const s = svg.getBoundingClientRect();
    const p = plate.getBoundingClientRect();
    const cx = p.left + p.width / 2;
    const cy = p.top + p.height / 2;
    const a = (p.width / 2) * 0.9;
    const b = (p.height / 2) * 0.9;
    const k =
      Math.sqrt(Math.pow(innerWidth / 2 / a, 2) + Math.pow(innerHeight / 2 / b, 2)) * 1.25;

    svg.style.transformOrigin = `${cx - s.left}px ${cy - s.top}px`;
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
