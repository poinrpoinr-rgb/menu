/* ========== السحب للتحديث: خيوط الجبن الذائب v2 (ينزل الغلاف مع السحب 100%) ========== */
(() => {
  const html = document.documentElement;
  const app = document.getElementById("app");
  if (!app) return;

  const THR = 84;
  const HOLD = 72;
  const MAXP = 155;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const vibe = (pat) => { try { if (navigator.vibrate) navigator.vibrate(pat); } catch (_) {} };

  const TXT = {
    ar: { idle: "اسحب لتحديث المنيو", ready: "فلّت للتحديث 🧀", busy: "جاري التحديث…", done: "تم التحديث ✓", fail: "تعذّر التحديث" },
    en: { idle: "Pull to refresh", ready: "Release to refresh 🧀", busy: "Refreshing…", done: "Updated ✓", fail: "Couldn't refresh" },
  };
  const L = () => TXT[html.lang === "en" ? "en" : "ar"];

  /* ---------- ستايل مضمّن (يفك قفل أنيميشن #app ويظهر الخلفية ورا الجبنة) ---------- */
  const st = document.createElement("style");
  st.textContent = `
    html { overscroll-behavior-y: contain; }
    body.is-cheese-active .app,
    body.is-pulling .app {
      animation: none !important;
    }
    #cheeseRefresh {
      position: fixed; top: 0; left: 0; right: 0; height: 0; z-index: 80;
      background: var(--bg, #16120f);
      pointer-events: none; display: none; contain: layout style;
    }
    #cheeseRefresh svg {
      position: absolute; top: 0; left: 0; width: 100%; overflow: visible;
      filter: drop-shadow(0 4px 8px rgba(154, 60, 0, .35));
    }
    #cheeseRefresh .lbl {
      position: absolute; left: 50%; bottom: 14px;
      display: inline-flex; align-items: center; gap: 7px;
      transform: translate3d(-50%, 0, 0) scale(.94);
      padding: .28rem .92rem; border-radius: 99px; white-space: nowrap;
      background: var(--surface, #fff9f0); color: var(--text, #261c14);
      border: 1.5px solid rgba(245, 162, 29, .4);
      font: 700 .83rem/1.3 var(--font-body, system-ui, sans-serif);
      box-shadow: 0 4px 14px rgba(0, 0, 0, .22);
      transition: opacity .18s ease, transform .2s cubic-bezier(.34,1.56,.64,1), border-color .2s;
    }
    #cheeseRefresh .lbl .spin {
      width: 12px; height: 12px; border-radius: 50%; display: none;
      border: 2px solid rgba(245, 162, 29, .28); border-top-color: #e8741a;
      animation: chSpin .65s linear infinite;
    }
    #cheeseRefresh .lbl[data-state="ready"] {
      transform: translate3d(-50%, -2px, 0) scale(1.06);
      border-color: #f5a21d;
      box-shadow: 0 5px 16px rgba(245, 162, 29, .4);
    }
    #cheeseRefresh .lbl[data-state="busy"] .spin { display: inline-block; }
    #cheeseRefresh .lbl[data-state="done"] { border-color: #22c55e; color: #15803d; }
    :root[data-theme="dark"] #cheeseRefresh .lbl[data-state="done"] { color: #4ade80; }
    #cheeseRefresh .lbl[data-state="fail"] { border-color: #ef4444; color: #b91c1c; animation: chShake .35s ease; }
    @keyframes chSpin { to { transform: rotate(360deg); } }
    @keyframes chShake {
      0%,100% { transform: translate3d(-50%, 0, 0); }
      25% { transform: translate3d(calc(-50% - 5px), 0, 0); }
      75% { transform: translate3d(calc(-50% + 5px), 0, 0); }
    }
    body.is-pulling { user-select: none; -webkit-user-select: none; cursor: grabbing; }
  `;
  document.head.appendChild(st);

  const ov = document.createElement("div");
  ov.id = "cheeseRefresh";
  ov.innerHTML = `
    <svg id="cheeseRefreshSvg" aria-hidden="true">
      <defs>
        <linearGradient id="tazaCg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffdc73"/>
          <stop offset="38%" stop-color="#ffb830"/>
          <stop offset="78%" stop-color="#f09018"/>
          <stop offset="100%" stop-color="#e06810"/>
        </linearGradient>
        <linearGradient id="tazaWisp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe28a" stop-opacity=".95"/>
          <stop offset="50%" stop-color="#ffc145" stop-opacity=".85"/>
          <stop offset="100%" stop-color="#ef8b17" stop-opacity=".95"/>
        </linearGradient>
      </defs>
      <g id="cheeseLayer"></g>
    </svg>
    <span class="lbl" id="cheeseRefreshLbl" role="status" aria-live="polite" data-state="idle">
      <span class="spin" aria-hidden="true"></span>
      <span class="txt"></span>
    </span>
  `;
  document.body.appendChild(ov);

  const svg = ov.querySelector("svg");
  const layer = ov.querySelector("#cheeseLayer");
  const lbl = ov.querySelector(".lbl");
  const lblTxt = lbl.querySelector(".txt");

  function setLabel(state, text) {
    if (lbl.dataset.state !== state) lbl.dataset.state = state;
    if (lblTxt.textContent !== text) lblTxt.textContent = text;
  }

  const STRANDS = [
    { f: .11, s:  1, b: .34, w: 1.05, d:  40, thick: true },
    { f: .26, s: -1, b: .52, w: 0.95, d: 110, thick: true },
    { f: .42, s:  1, b: .29, w: 1.15, d:  15, thick: true },
    { f: .58, s: -1, b: .56, w: 1.00, d: 145, thick: true },
    { f: .74, s:  1, b: .38, w: 0.92, d:  75, thick: true },
    { f: .89, s: -1, b: .46, w: 1.08, d: 185, thick: true },
    { f: .185, s: -1, b: .44, w: 0.42, d:  0, thick: false },
    { f: .340, s:  1, b: .38, w: 0.36, d: 25, thick: false },
    { f: .500, s: -1, b: .48, w: 0.44, d: 10, thick: false },
    { f: .660, s:  1, b: .35, w: 0.38, d: 50, thick: false },
    { f: .815, s: -1, b: .42, w: 0.40, d: 30, thick: false },
  ];

  function strandPath(x, y0, y1, hT, hM, hB, sw, thick) {
    const N = thick ? 14 : 10;
    let Lp = "", Rp = "", Hp = "";
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const y = lerp(y0, y1, t);
      const c = x + sw * Math.sin(Math.PI * t);
      const e = Math.pow(Math.abs(2 * t - 1), 2.2);
      const h = hM + (lerp(hT, hB, t) - hM) * e;
      Lp += `${i ? "L" : "M"}${(c - h).toFixed(1)} ${y.toFixed(1)} `;
      Rp = `L${(c + h).toFixed(1)} ${y.toFixed(1)} ` + Rp;
      if (thick && i > 0 && i < N) {
        Hp += `${i === 1 ? "M" : "L"}${(c - h * 0.42).toFixed(1)} ${y.toFixed(1)} `;
      }
    }
    const fill = thick ? "url(#tazaCg)" : "url(#tazaWisp)";
    let out = `<path d="${Lp}${Rp}Z" fill="${fill}"/>`;
    if (thick && (y1 - y0) > 16) {
      out += `<path d="${Hp}" fill="none" stroke="rgba(255,250,224,.52)" stroke-width="${Math.max(1.2, hM * 0.34).toFixed(1)}" stroke-linecap="round"/>`;
    }
    return out;
  }

  function draw(p, now) {
    const W = ov.clientWidth || innerWidth;
    const H = Math.max(p, 1);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.height = H + "px";
    if (p < 2) { layer.innerHTML = ""; return; }

    const q = Math.min(p / THR, 1.55);
    const seg = W / 9;
    let o = "";

    let band = `M-4 -6 L${W + 4} -6 L${W + 4} 5 L${W} 5 `;
    for (let k = 8; k >= 0; k--) {
      band += `Q${((k + .5) * seg).toFixed(1)} ${(13 + ((k * 5) % 4) * 2).toFixed(1)} ${(k * seg).toFixed(1)} 5 `;
    }
    o += `<path d="${band}Z" fill="url(#tazaCg)"/>`;

    for (let j = 0; j < 5; j++) {
      const dx = W * (.075 + .21 * j);
      const len = 3 + p * .085 * (1 + (j % 3));
      o += strandPath(dx, 2, 2 + len, 4.2, 2.2, 3.1, 0, false);
      o += `<circle cx="${dx.toFixed(1)}" cy="${(2 + len).toFixed(1)}" r="3.8" fill="#f5a21d"/>`;
      o += `<circle cx="${(dx - 1.2).toFixed(1)}" cy="${(1 + len).toFixed(1)}" r="1.2" fill="rgba(255,250,224,.65)"/>`;
    }

    const baseWm = Math.max(2.0, 17.5 / (1 + 2.5 * q * q));
    const snapScale = REDUCED ? 0.55 : 1;

    for (let i = 0; i < STRANDS.length; i++) {
      const s = STRANDS[i];
      const x = W * s.f;
      const hE = 11 * s.w;
      const wm = Math.max(s.thick ? 1.9 : 0.9, (baseWm / 2) * s.w);
      const sw = s.s * (s.thick ? 11 : 15) * Math.min(q, 1);
      const ti = S.snapAt ? (now - S.snapAt - s.d * snapScale) : -1;

      if (ti < 0) {
        o += strandPath(x, 0, p, hE, wm, hE, sw, s.thick);
        if (s.thick) {
          o += `<ellipse cx="${x.toFixed(1)}" cy="3.5" rx="${(hE + 3).toFixed(1)}" ry="5" fill="#ffb830"/>`;
          o += `<ellipse cx="${x.toFixed(1)}" cy="${p.toFixed(1)}" rx="${(hE + 4).toFixed(1)}" ry="5" fill="#e67315"/>`;
        }
      } else {
        const by = p * s.b;
        const kTop = ease(Math.min(ti / (340 * snapScale), 1));
        const lenT = lerp(by, (s.thick ? 14 : 6) + (i % 2) * 8, kTop);
        const swing = Math.sin(ti / 150) * (s.thick ? 2.6 : 1.8) * Math.exp(-ti / 620);

        o += strandPath(x, 0, lenT, hE, Math.max(1.2, wm), hE * .58, swing * .65, s.thick);
        const rTip = (s.thick ? 5.6 : 3.0) - kTop * .4;
        o += `<circle cx="${(x + swing).toFixed(1)}" cy="${(lenT + 1).toFixed(1)}" r="${rTip.toFixed(1)}" fill="#f5a21d"/>`;
        if (s.thick) {
          o += `<circle cx="${(x + swing - 1.6).toFixed(1)}" cy="${(lenT - 0.5).toFixed(1)}" r="1.4" fill="rgba(255,250,224,.7)"/>`;
        }

        const lenB = lerp(p - by, 0, ease(Math.min(ti / (420 * snapScale), 1)));
        if (lenB > 1.2) {
          o += strandPath(x, p - lenB, p, hE * .42, Math.max(1.1, wm * .8), hE, 0, s.thick);
        }
        if (s.thick) {
          o += `<ellipse cx="${x.toFixed(1)}" cy="${p.toFixed(1)}" rx="${(hE + 4).toFixed(1)}" ry="5" fill="#e67315"/>`;
        }

        const gy = by + 0.00068 * ti * ti;
        if (s.thick && ti < 720 && gy < p) {
          o += `<circle cx="${x.toFixed(1)}" cy="${gy.toFixed(1)}" r="3.4" fill="#ffb32c"/>`;
          o += `<circle cx="${(x - 1).toFixed(1)}" cy="${(gy - 1).toFixed(1)}" r="1.1" fill="rgba(255,250,224,.75)"/>`;
        }
      }
    }

    if (p > 8) {
      let lip = `M-4 ${(p + 8).toFixed(1)} L-4 ${p.toFixed(1)} `;
      for (let k = 0; k < 9; k++) {
        lip += `Q${((k + .5) * seg).toFixed(1)} ${(p - 9 - ((k * 7) % 3) * 2).toFixed(1)} ${((k + 1) * seg).toFixed(1)} ${p.toFixed(1)} `;
      }
      o += `<path d="${lip}L${W + 4} ${(p + 8).toFixed(1)}Z" fill="#e67315" opacity="${Math.min(1, p / 28).toFixed(2)}"/>`;
    }

    layer.innerHTML = o;
  }

  const S = { pos: 0, vel: 0, target: 0, raf: 0, lastT: 0, busy: false, drag: false, snapAt: 0, armed: false };

  function cleanupVisual() {
    S.snapAt = 0; S.armed = false;
    document.body.classList.remove("is-cheese-active");
    app.style.removeProperty("transform");
    app.style.willChange = "";
    ov.style.display = "none";
    ov.style.height = "0px";
    layer.innerHTML = "";
  }

  function render(now = performance.now()) {
    const p = Math.max(S.pos, 0);
    if (p > 0.5) {
      document.body.classList.add("is-cheese-active");
      app.style.willChange = "transform";
      app.style.setProperty("transform", `translate3d(0, ${p.toFixed(2)}px, 0)`, "important");
    } else {
      document.body.classList.remove("is-cheese-active");
      app.style.removeProperty("transform");
    }

    const show = p > 2;
    ov.style.display = show ? "block" : "none";
    ov.style.height = p.toFixed(2) + "px";

    if (!S.busy && !S.snapAt) {
      const ready = p >= THR;
      setLabel(ready ? "ready" : "idle", ready ? L().ready : L().idle);
      if (S.drag) {
        if (ready && !S.armed) { S.armed = true; vibe(12); }
        else if (p < THR - 10 && S.armed) { S.armed = false; }
      }
    }
    lbl.style.opacity = p > 14 ? "1" : "0";
    draw(p, now);
  }

  function tick(now) {
    if (!S.lastT) S.lastT = now;
    const dt = clamp((now - S.lastT) / 1000, 0.004, 0.04);
    S.lastT = now;

    const k = REDUCED ? 260 : 185;
    const c = (S.target === 0 || REDUCED) ? 26 : 14;
    S.vel += (-k * (S.pos - S.target) - c * S.vel) * dt;
    S.pos += S.vel * dt;

    const springDone = Math.abs(S.vel) < 0.08 && Math.abs(S.pos - S.target) < 0.08;
    if (springDone) { S.pos = S.target; S.vel = 0; }

    const snapActive = S.snapAt > 0 && (now - S.snapAt) < (REDUCED ? 900 : 1650);
    render(now);

    if (!springDone || snapActive) {
      S.raf = requestAnimationFrame(tick);
    } else {
      S.raf = 0; S.lastT = 0;
      if (S.pos <= 0.5 && !S.drag && !S.busy) cleanupVisual();
    }
  }

  function spring(target) {
    S.target = target;
    if (!S.raf) { S.lastT = 0; S.raf = requestAnimationFrame(tick); }
  }

  function runRefreshJob() {
    if (typeof window.tazaRefresh === "function") {
      try { return Promise.resolve(window.tazaRefresh()).then(Boolean, () => false); }
      catch (_) { return Promise.resolve(false); }
    }
    return fetch("data/menu.json?v=" + Date.now(), { cache: "no-store" })
      .then((r) => r.ok)
      .catch(() => false);
  }

  function release() {
    if (S.pos >= THR && !S.busy) {
      S.busy = true;
      S.snapAt = performance.now();
      vibe([10, 32, 16]);
      setLabel("busy", L().busy);
      spring(HOLD);

      Promise.all([runRefreshJob(), wait(1350)])
        .then(([ok]) => {
          setLabel(ok ? "done" : "fail", ok ? L().done : L().fail);
          if (!ok) vibe([20, 40, 20]);
          return wait(750);
        })
        .then(() => {
          S.busy = false;
          spring(0);
        });
    } else if (!S.busy) {
      spring(0);
    }
  }

  let lastScrollTime = 0;
  addEventListener("scroll", () => { if (window.scrollY > 2) lastScrollTime = performance.now(); }, { passive: true });

  function hasScrolledParent(el) {
    while (el && el !== document.body && el !== html) {
      if (el.scrollTop > 0) {
        const oy = getComputedStyle(el).overflowY;
        if (oy === "auto" || oy === "scroll") return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  const canPull = (target) =>
    !S.busy && window.scrollY <= 0 &&
    !document.body.classList.contains("modal-open") &&
    !document.body.classList.contains("is-loading") &&
    (!target || !hasScrolledParent(target));

  function begin() {
    S.drag = true; S.snapAt = 0; S.vel = 0; S.armed = false;
    cancelAnimationFrame(S.raf); S.raf = 0; S.lastT = 0;
    document.body.classList.add("is-pulling");
  }

  function end() {
    if (!S.drag) return;
    S.drag = false;
    document.body.classList.remove("is-pulling");
    release();
  }

  function setPull(dy) {
    S.pos = MAXP * (1 - Math.exp(-Math.max(dy, 0) / 235));
    render();
  }

  let t = null;
  addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1 || !canPull(e.target)) { t = null; return; }
    t = { x: e.touches[0].clientX, y: e.touches[0].clientY, on: false };
  }, { passive: true });

  addEventListener("touchmove", (e) => {
    if (!t) return;
    const dy = e.touches[0].clientY - t.y;
    const dx = e.touches[0].clientX - t.x;
    if (!t.on) {
      if (dy < -4) { t = null; return; }
      if (dy > 8 && dy > Math.abs(dx) * 1.15 && window.scrollY <= 0) { t.on = true; begin(); }
      else return;
    }
    if (e.cancelable) e.preventDefault();
    setPull(dy - 8);
  }, { passive: false });

  const touchEnd = () => { if (t && t.on) end(); t = null; };
  addEventListener("touchend", touchEnd);
  addEventListener("touchcancel", touchEnd);

  let m = null;
  addEventListener("mousedown", (e) => {
    if (e.button !== 0 || !canPull(e.target) || e.target.closest("a,button,input,textarea,select,.modal,.search-wrap,.catbar")) {
      m = null; return;
    }
    m = { y: e.clientY, on: false };
  });

  addEventListener("mousemove", (e) => {
    if (!m) return;
    const dy = e.clientY - m.y;
    if (!m.on) {
      if (dy < -4) { m = null; return; }
      if (dy > 10 && window.scrollY <= 0) { m.on = true; begin(); }
      else return;
    }
    e.preventDefault();
    setPull(dy - 10);
  });

  const mouseEnd = () => { if (m && m.on) end(); m = null; };
  addEventListener("mouseup", mouseEnd);
  document.addEventListener("mouseleave", mouseEnd);

  let wAcc = 0, wTimer = 0;
  const wheelDone = () => { if (S.drag) end(); wAcc = 0; };

  addEventListener("wheel", (e) => {
    if (e.ctrlKey) return;
    if (S.busy) { if (window.scrollY <= 0 && e.deltaY < 0) e.preventDefault(); return; }
    if (!S.drag && performance.now() - lastScrollTime < 220) return;
    if (!canPull(e.target)) return;

    const up = e.deltaY < 0 && window.scrollY <= 0;
    if (up || (S.drag && e.deltaY > 0)) {
      e.preventDefault();
      if (!S.drag) { begin(); wAcc = 0; }
      wAcc = Math.max(0, wAcc - e.deltaY);
      setPull(wAcc * 0.72);
      clearTimeout(wTimer);
      wTimer = setTimeout(wheelDone, 180);
    }
  }, { passive: false });
})();
