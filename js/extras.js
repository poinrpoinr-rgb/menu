/* ========== إضافات TAZA 041: زر الصعود الفيزيائي الأنيق + واجهة التقييم والكومنتات المتحركة ========== */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const html = document.documentElement;

  const TXT = {
    ar: {
      topAria: "الصعود لأعلى الصفحة",
      secTitle: "آراء زبائن تازة 041",
      secSub: "تجارب حقيقية من عشاق اللقمة الطازجة",
      writeBtn: "✍️ أضف تقييمك",
      backBtn: "← عرض الآراء",
      fbTitle: "كيف كانت تجربتك؟",
      fbSub: "اختر تقييمك وشاركنا رأيك السريع",
      fbTags: ["🍔 الطعم", "⚡ الخدمة", "✨ النظافة", "💰 الأسعار"],
      fbNamePh: "اسمك (اختياري)...",
      fbPlaceholder: "اكتب تعليقك هنا...",
      fbSend: "إرسال التقييم",
      fbThanks: "شكراً لك! تم استلام تقييمك وبانتظار المراجعة 💛",
      fbRatingMsg: [
        "نعتذر منك! سنحسّن تجربتك 😔",
        "ملاحظتك مهمة جداً لنا 🙏",
        "شكراً! نسعى دائماً للأفضل 🙂",
        "سعداء جداً بإعجابك! 😋",
        "حب من أول لقمة! 🍔❤️",
      ],
      demoReviews: [
        { name: "أحمد م.", rating: 5, tags: ["🍔 الطعم", "⚡ الخدمة"], note: "برجر دبل شيدر رهيب والجبنة سايحة، حرفياً حب من أول لقمة!", time: "اليوم" },
        { name: "سارة ك.", rating: 5, tags: ["✨ النظافة", "🍔 الطعم"], note: "الزنجر حار ومقرمش والبطاطا واصلة سخنة، أنصح فيه بقوة 🔥", time: "أمس" },
        { name: "كريم ح.", rating: 4, tags: ["💰 الأسعار", "⚡ الخدمة"], note: "أجنحة الدجاج تتبيلتها مميزة والتوصيل كان سريع جداً.", time: "منذ يومين" },
      ],
    },
    en: {
      topAria: "Back to top",
      secTitle: "TAZA 041 Reviews",
      secSub: "Real love from our fresh-bite fans",
      writeBtn: "✍️ Leave a Review",
      backBtn: "← Back to Reviews",
      fbTitle: "How was your experience?",
      fbSub: "Pick a rating and share your quick thought",
      fbTags: ["🍔 Taste", "⚡ Service", "✨ Hygiene", "💰 Value"],
      fbNamePh: "Your name (optional)...",
      fbPlaceholder: "Write your comment here...",
      fbSend: "Submit Review",
      fbThanks: "Thank you! Your review was received for approval 💛",
      fbRatingMsg: [
        "Sorry! We will do better 😔",
        "Thanks for letting us know 🙏",
        "Thanks! Always improving 🙂",
        "Glad you enjoyed it! 😋",
        "Love at first bite! 🍔❤️",
      ],
      demoReviews: [
        { name: "Ahmad M.", rating: 5, tags: ["🍔 Taste", "⚡ Service"], note: "The Double Cheddar Burger is insane! Truly love at first bite!", time: "Today" },
        { name: "Sara K.", rating: 5, tags: ["✨ Hygiene", "🍔 Taste"], note: "Spicy crispy Zinger arrived super hot and fresh 🔥", time: "Yesterday" },
        { name: "Karim H.", rating: 4, tags: ["💰 Value", "⚡ Service"], note: "Amazing wings seasoning and super fast service.", time: "2 days ago" },
      ],
    },
  };
  const T = () => TXT[html.lang === "en" ? "en" : "ar"];

  const st = document.createElement("style");
  st.textContent = `
    /* ===== 1) زر الصعود للأعلى (أنيق + حلقة التقدم + انطلاق السهم) ===== */
    .btt {
      position: fixed; bottom: 1.25rem; inset-inline-end: 1.15rem; z-index: 65;
      width: 50px; height: 50px; padding: 0; border: 0; border-radius: 50%;
      background: var(--surface); color: var(--text);
      box-shadow: 0 8px 22px rgba(21, 18, 16, 0.24); cursor: pointer;
      display: grid; place-items: center; opacity: 0; overflow: hidden;
      transform: translateY(24px) scale(0.6); pointer-events: none;
      transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btt.is-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .btt:hover { transform: translateY(-4px) scale(1.07); background: var(--cheddar); }
    .btt:hover .btt__arrow { color: var(--ink); transform: translateY(-2px); }
    .btt:active { transform: scale(0.92); }
    .btt__ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
    .btt__track { fill: none; stroke: var(--line-soft); stroke-width: 3.5; }
    .btt__prog  { fill: none; stroke: var(--cheddar); stroke-width: 3.5; stroke-linecap: round; transition: stroke-dashoffset 0.1s linear; }
    .btt:hover .btt__prog { stroke: var(--ink); }
    .btt__arrow {
      position: relative;
      color: var(--cheddar-deep);
      transition: transform 0.25s ease, color 0.25s ease;
    }
    :root[data-theme="dark"] .btt__arrow { color: var(--cheddar-light); }
    .btt.is-launching .btt__arrow { animation: btt-arrow-fly 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes btt-arrow-fly {
      0%   { transform: translateY(0); opacity: 1; }
      45%  { transform: translateY(-28px); opacity: 0; }
      46%  { transform: translateY(28px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }

    /* ===== 2) قسم التقييمات + نموذج التقييم السريع ===== */
    .fb-wrap { max-width: 620px; margin: 0.5rem auto 2.5rem; padding: 0 1rem; }
    .fb-shell {
      position: relative; overflow: hidden; padding: 1.35rem 1.25rem 1.45rem;
      border-radius: 28px; background: var(--surface);
      border: 1.5px solid var(--line-soft); box-shadow: var(--card-shadow);
    }
    .fb-topbar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; }
    .fb-topbar__text { text-align: start; }
    .fb-title { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; line-height: 1.15; color: var(--text); }
    .fb-sub { margin: 0.15rem 0 0; font-size: 0.84rem; color: var(--muted); }
    .fb-mode-btn {
      flex: none; padding: 0.44rem 0.95rem; border: 0; border-radius: 99px;
      background: var(--cheddar); color: var(--ink); font: 700 0.84rem var(--font-body);
      box-shadow: 0 4px 12px rgba(238, 122, 26, 0.28); cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .fb-mode-btn:hover { transform: translateY(-2px) scale(1.04); }
    .fb-mode-btn.is-ghost { background: var(--bg); color: var(--text); border: 1px solid var(--line-soft); box-shadow: none; }

    .fb-view { animation: fb-view-in 0.42s cubic-bezier(0.22, 1.15, 0.36, 1) both; }
    .fb-view[hidden] { display: none; }
    @keyframes fb-view-in { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }

    .rev-stage {
      position: relative; min-height: 128px; padding: 1rem 1.1rem;
      border-radius: 20px; background: var(--bg); border: 1px solid var(--line-soft); text-align: start;
    }
    .rev-item.slide-in-next { animation: rev-next 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .rev-item.slide-in-prev { animation: rev-prev 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    @keyframes rev-next { from { opacity: 0; transform: translateX(-24px) scale(0.98); } to { opacity: 1; transform: none; } }
    @keyframes rev-prev { from { opacity: 0; transform: translateX(24px) scale(0.98); } to { opacity: 1; transform: none; } }

    .rev-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.45rem; }
    .rev-user { display: inline-flex; align-items: center; gap: 0.5rem; }
    .rev-avatar {
      width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
      background: linear-gradient(145deg, var(--cheddar-light), var(--cheddar-deep));
      color: var(--ink); font-weight: 700; font-size: 0.85rem;
    }
    .rev-name { font-weight: 700; font-size: 0.94rem; color: var(--text); }
    .rev-time { font-size: 0.75rem; color: var(--muted); }
    .rev-stars { color: var(--cheddar); font-size: 0.92rem; letter-spacing: 1px; }
    .rev-note { margin: 0 0 0.65rem; font-size: 0.94rem; line-height: 1.6; color: var(--text); }
    .rev-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .rev-tag { padding: 0.16rem 0.6rem; border-radius: 99px; background: var(--surface); border: 1px solid var(--line-soft); font-size: 0.76rem; font-weight: 700; color: var(--muted); }

    .rev-controls { display: flex; align-items: center; justify-content: space-between; margin-top: 0.85rem; }
    .rev-dots { display: flex; align-items: center; gap: 0.38rem; }
    .rev-dot { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 99px; background: var(--line-soft); cursor: pointer; transition: width 0.3s ease, background 0.25s ease; }
    .rev-dot.is-active { width: 22px; background: var(--cheddar); }
    .rev-arrows { display: flex; gap: 0.4rem; }
    .rev-arrow { width: 34px; height: 34px; padding: 0; border: 1px solid var(--line-soft); border-radius: 50%; background: var(--bg); color: var(--text); display: grid; place-items: center; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }
    .rev-arrow:hover { background: var(--cheddar); color: var(--ink); border-color: transparent; }
    [dir="ltr"] .rev-arrow svg { transform: scaleX(-1); }

    .fb-form { text-align: center; }
    .fb-burger-stage { position: relative; display: inline-grid; place-items: center; width: 48px; height: 48px; font-size: 2.1rem; margin-bottom: 0.15rem; }
    .fb-burger { display: inline-block; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .fb-burger.is-happy { animation: fb-burger-love 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes fb-burger-love { 0% { transform: scale(1) rotate(0); } 30% { transform: scale(1.38) rotate(-12deg); } 60% { transform: scale(1.25) rotate(12deg); } 100% { transform: scale(1.08) rotate(0); } }
    .fb-heart { position: absolute; font-size: 1.05rem; pointer-events: none; animation: fb-heart-fly 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fb-heart-fly { 0% { opacity: 0; transform: translate(0, 0) scale(0.3); } 20% { opacity: 1; transform: translate(var(--hx1), var(--hy1)) scale(1.15) rotate(var(--hr)); } 100% { opacity: 0; transform: translate(var(--hx2), var(--hy2)) scale(0.5) rotate(var(--hr)); } }
    .fb-msg { margin: 0 0 0.65rem; font-size: 0.88rem; font-weight: 700; color: var(--cheddar-deep); min-height: 1.3em; }
    :root[data-theme="dark"] .fb-msg { color: var(--cheddar-light); }
    .fb-stars { display: inline-flex; justify-content: center; gap: 0.35rem; direction: ltr; margin-bottom: 0.85rem; }
    .fb-star { width: 42px; height: 42px; padding: 0; border: 0; background: none; color: var(--line-soft); cursor: pointer; display: grid; place-items: center; transition: transform 0.25s ease, color 0.2s ease; }
    .fb-star svg { width: 32px; height: 32px; fill: currentColor; }
    .fb-star.is-lit { color: var(--cheddar); filter: drop-shadow(0 3px 8px rgba(245, 162, 29, 0.4)); }
    .fb-star:hover { transform: scale(1.2) rotate(-6deg); }
    .fb-star.is-pop { animation: jelly-press 0.45s ease; }
    .fb-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; margin-bottom: 0.8rem; }
    .fb-tag { padding: 0.3rem 0.78rem; border-radius: 99px; border: 1px solid var(--line-soft); background: var(--bg); color: var(--text); font: 700 0.82rem var(--font-body); cursor: pointer; }
    .fb-tag.is-on { background: var(--cheddar); color: var(--ink); border-color: transparent; }
    .fb-fields { display: flex; flex-direction: column; gap: 0.55rem; }
    .fb-row { display: flex; gap: 0.5rem; }
    .fb-input { flex: 1; min-width: 0; height: 42px; padding: 0 0.95rem; border-radius: 99px; border: 1.5px solid var(--line-soft); background: var(--bg); color: var(--text); font: 500 0.9rem var(--font-body); outline: none; }
    .fb-input:focus { border-color: var(--cheddar); }
    .fb-send { flex: none; height: 42px; padding: 0 1.25rem; border: 0; border-radius: 99px; background: var(--cheddar); color: var(--ink); font: 700 0.9rem var(--font-body); cursor: pointer; }
    .fb-send:disabled { opacity: 0.45; cursor: not-allowed; }
    .fb-done { padding: 1rem 0.5rem; font-weight: 700; color: #15803d; font-size: 0.98rem; }
    :root[data-theme="dark"] .fb-done { color: #4ade80; }
  `;
  document.head.appendChild(st);

  /* ---------- محرك الصعود الصاروخي الناعم لأول الصفحة ---------- */
  let topAnimId = null;

  function smoothFlyToTop() {
    if (topAnimId) cancelAnimationFrame(topAnimId);
    const startY = window.scrollY;
    if (startY <= 2) return;

    const menuEl = $("#menu");
    const duration = Math.min(850, Math.max(520, startY * 0.32));
    const startTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    if (menuEl) menuEl.classList.add("is-warping-up");
    setTimeout(() => menuEl && menuEl.classList.remove("is-warping-up"), duration * 0.75);

    const stopFly = () => {
      if (topAnimId) { cancelAnimationFrame(topAnimId); topAnimId = null; }
      if (menuEl) menuEl.classList.remove("is-warping-up");
      window.removeEventListener("wheel", stopFly);
      window.removeEventListener("touchstart", stopFly);
    };
    window.addEventListener("wheel", stopFly, { passive: true, once: true });
    window.addEventListener("touchstart", stopFly, { passive: true, once: true });

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY * (1 - easeInOutCubic(progress)));
      if (progress < 1) {
        topAnimId = requestAnimationFrame(step);
      } else {
        stopFly();
      }
    }
    topAnimId = requestAnimationFrame(step);
  }

  function initBackToTop() {
    if ($("#bttBtn")) return;
    const R = 22, C = 2 * Math.PI * R;
    const btn = document.createElement("button");
    btn.id = "bttBtn";
    btn.type = "button";
    btn.className = "btt";
    btn.setAttribute("aria-label", T().topAria);
    btn.innerHTML = `
      <svg class="btt__ring" viewBox="0 0 50 50" aria-hidden="true">
        <circle class="btt__track" cx="25" cy="25" r="${R}"/>
        <circle class="btt__prog" id="bttProg" cx="25" cy="25" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/>
      </svg>
      <svg class="btt__arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>`;
    document.body.appendChild(btn);

    const prog = $("#bttProg");
    let ticking = false;
    function updateBtt() {
      ticking = false;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      prog.style.strokeDashoffset = (C * (1 - Math.min(1, Math.max(0, y / max)))).toFixed(1);
      btn.classList.toggle("is-visible", y > 260);
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateBtt); } }, { passive: true });
    updateBtt();

    btn.addEventListener("click", () => {
      btn.classList.remove("is-launching");
      void btn.offsetWidth;
      btn.classList.add("is-launching");
      smoothFlyToTop();
      setTimeout(() => btn.classList.remove("is-launching"), 650);
    });

    // نربط لوقو الشريط المثبت ولوقو الفوتر بنفس الصعود الصاروخي الناعم!
    $("#catLogo")?.addEventListener("click", (e) => { e.stopImmediatePropagation(); smoothFlyToTop(); }, true);
    document.addEventListener("click", (e) => {
      if (e.target.closest("#footerTopBtn")) { e.stopImmediatePropagation(); smoothFlyToTop(); }
    }, true);
  }

  function spawnBurgerHearts(stage) {
    ["❤️", "💛", "🧡", "❤️", "💖", "💛"].forEach((h, i) => {
      const el = document.createElement("span");
      el.className = "fb-heart";
      el.textContent = h;
      const angle = (-150 + i * 24) * (Math.PI / 180);
      el.style.setProperty("--hx1", `${(Math.cos(angle) * 26).toFixed(0)}px`);
      el.style.setProperty("--hy1", `${(Math.sin(angle) * 26).toFixed(0)}px`);
      el.style.setProperty("--hx2", `${(Math.cos(angle) * 62).toFixed(0)}px`);
      el.style.setProperty("--hy2", `${(Math.sin(angle) * 62 - 14).toFixed(0)}px`);
      el.style.setProperty("--hr", `${Math.round((Math.random() - 0.5) * 40)}deg`);
      el.style.animationDelay = `${i * 55}ms`;
      stage.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    });
  }

  let autoSlideTimer = 0;

  function renderFeedbackSection() {
    clearInterval(autoSlideTimer);
    const footer = $("#siteFooter");
    if (!footer) return;

    let wrap = $("#quickFeedbackWrap");
    if (!wrap) {
      wrap = document.createElement("section");
      wrap.id = "quickFeedbackWrap";
      wrap.className = "fb-wrap";
      footer.parentNode.insertBefore(wrap, footer);
    }

    const t = T();
    const starSvg = `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    const reviews = t.demoReviews;

    wrap.innerHTML = `
      <div class="fb-shell">
        <div class="fb-topbar">
          <div class="fb-topbar__text">
            <h3 class="fb-title" id="fbHeaderTitle">${t.secTitle}</h3>
            <p class="fb-sub">${t.secSub}</p>
          </div>
          <button class="fb-mode-btn" id="fbModeToggle" type="button">${t.writeBtn}</button>
        </div>

        <div class="fb-view" id="fbListView">
          <div class="rev-stage" id="revStage"></div>
          <div class="rev-controls">
            <div class="rev-dots" id="revDots">
              ${reviews.map((_, i) => `<button class="rev-dot${i === 0 ? " is-active" : ""}" type="button" data-i="${i}"></button>`).join("")}
            </div>
            <div class="rev-arrows">
              <button class="rev-arrow" id="revPrev" type="button"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
              <button class="rev-arrow" id="revNext" type="button"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            </div>
          </div>
        </div>

        <div class="fb-view fb-form" id="fbFormView" hidden>
          <div class="fb-burger-stage" id="fbBurgerStage" aria-hidden="true"><span class="fb-burger" id="fbBurger">🍔</span></div>
          <p class="fb-msg" id="fbMsg">${t.fbSub}</p>
          <div class="fb-stars" id="fbStars">
            ${[1, 2, 3, 4, 5].map((n) => `<button class="fb-star" type="button" data-v="${n}">${starSvg}</button>`).join("")}
          </div>
          <div class="fb-tags" id="fbTags">
            ${t.fbTags.map((tg) => `<button class="fb-tag" type="button" data-tg="${tg}">${tg}</button>`).join("")}
          </div>
          <div class="fb-fields">
            <input class="fb-input" id="fbName" type="text" maxlength="30" placeholder="${t.fbNamePh}">
            <div class="fb-row">
              <input class="fb-input" id="fbNote" type="text" maxlength="160" placeholder="${t.fbPlaceholder}">
              <button class="fb-send" id="fbSend" type="button" disabled>${t.fbSend}</button>
            </div>
          </div>
        </div>
      </div>`;

    let cur = 0;
    const revStage = $("#revStage", wrap);
    const revDots = [...wrap.querySelectorAll(".rev-dot")];

    function showReview(idx, dir = "next") {
      cur = (idx + reviews.length) % reviews.length;
      const r = reviews[cur];
      const starsStr = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
      revStage.innerHTML = `
        <div class="rev-item ${dir === "prev" ? "slide-in-prev" : "slide-in-next"}">
          <div class="rev-head">
            <div class="rev-user">
              <span class="rev-avatar" aria-hidden="true">${r.name.charAt(0)}</span>
              <div><div class="rev-name">${r.name}</div><div class="rev-time">${r.time}</div></div>
            </div>
            <div class="rev-stars">${starsStr}</div>
          </div>
          <p class="rev-note">"${r.note}"</p>
          <div class="rev-tags">${r.tags.map((tg) => `<span class="rev-tag">${tg}</span>`).join("")}</div>
        </div>`;
      revDots.forEach((d, i) => d.classList.toggle("is-active", i === cur));
    }

    showReview(0);
    const startAuto = () => {
      clearInterval(autoSlideTimer);
      autoSlideTimer = setInterval(() => { if (!$("#fbListView", wrap).hidden) showReview(cur + 1, "next"); }, 4800);
    };
    startAuto();

    $("#revNext", wrap).addEventListener("click", () => { showReview(cur + 1, "next"); startAuto(); });
    $("#revPrev", wrap).addEventListener("click", () => { showReview(cur - 1, "prev"); startAuto(); });
    revDots.forEach((d) => d.addEventListener("click", () => { const i = Number(d.dataset.i); showReview(i, i >= cur ? "next" : "prev"); startAuto(); }));

    let isForm = false;
    const modeBtn = $("#fbModeToggle", wrap), listView = $("#fbListView", wrap), formView = $("#fbFormView", wrap), hTitle = $("#fbHeaderTitle", wrap);
    modeBtn.addEventListener("click", () => {
      isForm = !isForm;
      listView.hidden = isForm;
      formView.hidden = !isForm;
      modeBtn.classList.toggle("is-ghost", isForm);
      modeBtn.textContent = isForm ? T().backBtn : T().writeBtn;
      hTitle.textContent = isForm ? T().fbTitle : T().secTitle;
    });

    let rating = 0;
    const selectedTags = new Set();
    const stars = [...wrap.querySelectorAll(".fb-star")];
    const fbMsg = $("#fbMsg", wrap), fbBurger = $("#fbBurger", wrap), fbStage = $("#fbBurgerStage", wrap), sendBtn = $("#fbSend", wrap);

    stars.forEach((btn) => {
      btn.addEventListener("click", () => {
        rating = Number(btn.dataset.v);
        sendBtn.disabled = false;
        stars.forEach((s, idx) => {
          s.classList.toggle("is-lit", idx < rating);
          if (idx === rating - 1) { s.classList.remove("is-pop"); void s.offsetWidth; s.classList.add("is-pop"); }
        });
        fbMsg.textContent = T().fbRatingMsg[rating - 1];
        if (rating === 5) { fbBurger.classList.remove("is-happy"); void fbBurger.offsetWidth; fbBurger.classList.add("is-happy"); spawnBurgerHearts(fbStage); }
      });
    });

    $("#fbTags", wrap).addEventListener("click", (e) => {
      const tgBtn = e.target.closest(".fb-tag");
      if (!tgBtn) return;
      const val = tgBtn.dataset.tg;
      if (selectedTags.has(val)) { selectedTags.delete(val); tgBtn.classList.remove("is-on"); }
      else { selectedTags.add(val); tgBtn.classList.add("is-on"); }
    });

    sendBtn.addEventListener("click", () => {
      if (!rating) return;
      const entry = {
        id: Date.now(), createdAt: new Date().toISOString(), status: "pending",
        name: ($("#fbName", wrap).value || "").trim() || (html.lang === "en" ? "Guest" : "ضيف تازة"),
        rating, tags: [...selectedTags], note: ($("#fbNote", wrap).value || "").trim(),
      };
      try {
        const list = JSON.parse(localStorage.getItem("taza-feedbacks") || "[]");
        list.unshift(entry);
        localStorage.setItem("taza-feedbacks", JSON.stringify(list));
      } catch (_) {}
      if (rating === 5) spawnBurgerHearts(fbStage);
      formView.innerHTML = `<div class="fb-done">${T().fbThanks}</div>`;
    });
  }

  initBackToTop();
  renderFeedbackSection();
  new MutationObserver(() => {
    $("#bttBtn")?.setAttribute("aria-label", T().topAria);
    renderFeedbackSection();
  }).observe(html, { attributes: true, attributeFilter: ["lang"] });
})();
