/* ========== شاشة التحميل السريعة ========== */
const Loader = (() => {
  const MIN_DURATION = 950;   // مدة أنيميشن الغطاء
  const MAX_WAIT = 2200;      // أقصى انتظار مهما كان النت بطيئاً!
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
    fill.style.transform = `scaleX(${p / 100})`;
    percent.textContent = `${Math.round(p)}%`;
  }

  function zoomIntoPlate() {
    const svg = el.querySelector(".cloche");
    const plate = document.getElementById("plate");
    const s = svg.getBoundingClientRect();
    const p = plate.getBoundingClientRect();

    const cx = p.left + p.width / 2;
    const cy = p.top + p.height / 2;

    const a = (p.width / 2) * 0.9;
    const b = (p.height / 2) * 0.9;
    const k =
      Math.sqrt(Math.pow(innerWidth / 2 / a, 2) + Math.pow(innerHeight / 2 / b, 2)) * 1.25;

    svg.style.transformOrigin = `${cx - s.left}px ${cy - s.top}px`;
    svg.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: `translate(${innerWidth / 2 - cx}px, ${innerHeight / 2 - cy}px) scale(${k})` },
      ],
      { duration: ZOOM_DURATION, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
    );
  }

  function openSite() {
    el.classList.add("done");
    document.body.classList.replace("is-loading", "is-ready");
    el.addEventListener("transitionend", (e) => e.target === el && el.remove(), { once: false });
    setTimeout(() => el.isConnected && el.remove(), 1200);
  }

  function finish() {
    if (finished) return;
    finished = true;
    setProgress(100);
    setTimeout(() => {
      el.classList.add("leaving");
      zoomIntoPlate();
      setTimeout(openSite, ZOOM_DURATION * OPEN_AT);
    }, 120);
  }

  function start() {
    const t0 = performance.now();
    // صمام أمان: لو النت علق لأي سبب، يفتح الموقع غصباً عنه بعد MAX_WAIT
    setTimeout(finish, MAX_WAIT);

    function tick(now) {
      if (finished) return;
      const elapsed = now - t0;
      let p = easeOut(Math.min(elapsed / MIN_DURATION, 1)) * 100;
      if (!pageLoaded && elapsed < MAX_WAIT) p = Math.min(p, 92);
      setProgress(p);

      if (p >= 100) return finish();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  return { start };
})();

if (sessionStorage.getItem("taza-seen-intro")) {
  const el = document.getElementById("loader");
  if (el) el.remove();
  document.body.classList.replace("is-loading", "is-ready");
} else {

  if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
  sessionStorage.setItem("taza-seen-intro", "1");
  Loader.start();
}
