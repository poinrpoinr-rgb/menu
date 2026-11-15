/* ========== شاشة التحميل ========== */
const Loader = (() => {
  const MIN_DURATION = 1300; // أقل مدة للتحميل (مللي ثانية)، لازم تطابق مدة أنيميشن الغطاء في CSS
  const ZOOM_DURATION = 900; // مدة الزوم داخل الصحن
  const OPEN_AT = 0.7;       // نسبة الزوم الي بعدها يبدأ الموقع يظهر

  const el = document.getElementById("loader");
  const fill = document.getElementById("loaderFill");
  const percent = document.getElementById("loaderPercent");

  let pageLoaded = document.readyState === "complete";
  window.addEventListener("load", () => (pageLoaded = true));

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function setProgress(p) {
    fill.style.transform = `scaleX(${p / 100})`;
    percent.textContent = `${Math.round(p)}%`;
  }

  // الزوم: الصحن يكبر لين يملا الشاشة
  function zoomIntoPlate() {
    const svg = el.querySelector(".cloche");
    const plate = document.getElementById("plate");
    const s = svg.getBoundingClientRect();
    const p = plate.getBoundingClientRect();

    const cx = p.left + p.width / 2;
    const cy = p.top + p.height / 2;

    // نحسب أقل تكبير يخلي بيضاوي الصحن يغطي الشاشة كلها (مع هامش أمان)
    const a = (p.width / 2) * 0.9;
    const b = (p.height / 2) * 0.9;
    const k =
      Math.sqrt(Math.pow(innerWidth / 2 / a, 2) + Math.pow(innerHeight / 2 / b, 2)) * 1.25;

    svg.style.transformOrigin = `${cx - s.left}px ${cy - s.top}px`;
    svg.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        {
          transform: `translate(${innerWidth / 2 - cx}px, ${innerHeight / 2 - cy}px) scale(${k})`,
        },
      ],
      { duration: ZOOM_DURATION, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
    );
  }

  function openSite() {
    el.classList.add("done");
    document.body.classList.replace("is-loading", "is-ready");
    el.addEventListener(
      "transitionend",
      (e) => e.target === el && el.remove(),
      { once: false }
    );
    setTimeout(() => el.isConnected && el.remove(), 1500); // احتياط
  }

  function finish() {
    setTimeout(() => {
      el.classList.add("leaving"); // الاسم والشريط يختفون
      zoomIntoPlate();
      setTimeout(openSite, ZOOM_DURATION * OPEN_AT);
    }, 200);
  }

  function start() {
    const t0 = performance.now();

    function tick(now) {
      let p = easeOut(Math.min((now - t0) / MIN_DURATION, 1)) * 100;
      if (!pageLoaded) p = Math.min(p, 90); // ما نوصل 100% إلا بعد تحميل الصفحة فعلياً
      setProgress(p);

      if (p >= 100) return finish();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  return { start };
})();

Loader.start();
