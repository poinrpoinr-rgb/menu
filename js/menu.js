/* ========== المنيو: تحميل البيانات + عرض الأقسام + الشريط المثبت ========== */
(() => {
  const LANG = "ar"; // نربطها بزر اللغة لاحقاً
  const $ = (sel, root = document) => root.querySelector(sel);

  const STR = {
    ar: { featured: "الأكثر طلباً", spicy: "حار", vegetarian: "نباتي" },
    en: { featured: "Best seller", spicy: "Spicy", vegetarian: "Vegetarian" },
  }[LANG];
  const TAG_ICONS = { spicy: "🌶️", vegetarian: "🌱" };

  const pick = (obj, key) => (LANG === "en" && obj[key + "_en"]) || obj[key];
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const price = (n, cur) => `${Number(n).toLocaleString("en-US")} ${cur}`;

  async function loadData() {
    try {
      const res = await fetch("data/menu.json");
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  /* ---------- عرض الأقسام ---------- */
  function renderMenu(data) {
    const cur = pick(data.restaurant, "currency");
    const cats = data.categories.filter((c) =>
      data.items.some((i) => i.category === c.id && i.available !== false)
    );

    const card = (i, c, cur) => {
      const tagsHtml = (i.tags || [])
        .filter((t) => TAG_ICONS[t])
        .map((t) => `<span class="tag" title="${esc(STR[t])}" aria-label="${esc(STR[t])}">${TAG_ICONS[t]}</span>`)
        .join("");
      return `
        <article class="dish${i.featured ? " dish--featured" : ""}">
          <div class="dish__media">
            <div class="dish__ph" aria-hidden="true"><span class="dish__ph-icon">${esc(c.icon)}</span></div>
            ${i.image ? `<img src="${esc(i.image)}" alt="${esc(pick(i, "name"))}" loading="lazy">` : ""}
            ${i.featured ? `<span class="dish__flag">🔥 ${esc(STR.featured)}</span>` : ""}
            ${tagsHtml ? `<span class="dish__tags">${tagsHtml}</span>` : ""}
            <span class="dish__price">${esc(price(i.price, cur))}</span>
          </div>
          <div class="dish__body">
            <h3 class="dish__name">${esc(pick(i, "name"))}</h3>
            <p class="dish__desc">${esc(pick(i, "description"))}</p>
          </div>
        </article>`;
    };

    $("#menu").innerHTML = cats
      .map((c) => {
        // الأطباق المميزة أول القسم (عشان البطاقات العريضة ما تخلي فراغات في الشبكة)
        const items = data.items
          .filter((i) => i.category === c.id && i.available !== false)
          .sort((x, y) => Number(!!y.featured) - Number(!!x.featured));
        return `
      <section class="menu-section" id="cat-${esc(c.id)}">
        <h2 class="menu-section__title"><span aria-hidden="true">${esc(c.icon)}</span>${esc(pick(c, "name"))}</h2>
        <div class="dishes">${items.map((i) => card(i, c, cur)).join("")}</div>
      </section>`;
      })
      .join("");

    // لو صورة طبق ما انحملت نخفيها ويبقى البديل (التدرج + الإيموجي)
    $("#menu").querySelectorAll(".dish__media img").forEach((img) =>
      img.addEventListener("error", () => img.remove())
    );

    return cats;
  }

  /* ---------- ظهور البطاقات وقت السكرول (مرة وحدة لكل بطاقة) ---------- */
  function revealOnScroll() {
    if (!("IntersectionObserver" in window)) return; // بدونها تبقى البطاقات ظاهرة عادي
    const menu = $("#menu");
    menu.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            e.target.style.setProperty("--d", Math.min(i, 5) * 70 + "ms");
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    menu.querySelectorAll(".dish").forEach((d) => io.observe(d));
  }

  /* ---------- شريط الأقسام ---------- */
  function initCatBar(cats) {
    const bar = $("#catbar");
    const track = $("#catTrack");
    const inner = $("#catInner");
    const pill = $("#catPill");

    inner.insertAdjacentHTML(
      "beforeend",
      cats
        .map(
          (c) => `
      <button class="cat" type="button" data-cat="${esc(c.id)}">
        <span class="cat__icon" aria-hidden="true">${esc(c.icon)}</span>
        <span class="cat__name">${esc(pick(c, "name"))}</span>
      </button>`
        )
        .join("")
    );
    bar.hidden = false;

    const buttons = [...inner.querySelectorAll(".cat")];
    const sections = buttons.map((b) => document.getElementById("cat-" + b.dataset.cat));
    let active = -1;
    let locked = false; // نوقف التتبع أثناء السكرول الي سببه ضغطة على قسم
    let lockTimer;

    // الحبة تنزلق لزر القسم النشط
    function movePill(btn, animate) {
      if (!animate) pill.style.transition = "none";
      pill.style.width = btn.offsetWidth + "px";
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      if (!animate) {
        void pill.offsetWidth;
        pill.style.transition = "";
      }
    }

    // الشريط يحرك نفسه عشان القسم النشط يبقى بالنص
    function centerButton(btn) {
      const b = btn.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      const delta = b.left + b.width / 2 - (t.left + t.width / 2);
      if (Math.abs(delta) > 2) track.scrollBy({ left: delta, behavior: "smooth" });
    }

    function pulseIcon(btn) {
      const icon = $(".cat__icon", btn);
      icon.classList.remove("pulse");
      void icon.offsetWidth;
      icon.classList.add("pulse");
      icon.addEventListener("animationend", () => icon.classList.remove("pulse"), { once: true });
    }

    function setActive(i, { instant = false } = {}) {
      if (i === active) return;
      active = i;
      buttons.forEach((b, j) => {
        b.classList.toggle("is-active", j === i);
        b.setAttribute("aria-current", j === i ? "true" : "false");
      });
      movePill(buttons[i], !instant);
      centerButton(buttons[i]);
    }

    // ضغطة على قسم: النبضة + سكرول ناعم
    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        locked = true;
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => (locked = false), 500);
        setActive(i);
        pulseIcon(btn);
        sections[i].scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // تتبع السكرول: القسم الي قدامك هو النشط
    let ticking = false;
    function spy() {
      ticking = false;
      if (locked) return;
      const line = bar.offsetHeight + 24;
      let idx = 0;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= line) idx = i;
      });
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) idx = sections.length - 1;
      setActive(idx);
    }

    addEventListener(
      "scroll",
      () => {
        if (locked) {
          clearTimeout(lockTimer);
          lockTimer = setTimeout(() => (locked = false), 140);
          return;
        }
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(spy);
        }
      },
      { passive: true }
    );

    // الشريط يثبت: يطلع اللوقو المصغر والظل
    new IntersectionObserver(
      ([e]) => bar.classList.toggle("is-stuck", !e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 }
    ).observe($("#catSentinel"));

    $("#catLogo").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

    // إعادة ضبط الحبة لو تغير الحجم أو نزل الخط
    const replace = () => active >= 0 && movePill(buttons[active], false);
    new ResizeObserver(replace).observe(inner);
    new ResizeObserver(replace).observe(track);
    document.fonts && document.fonts.ready.then(replace);

    setActive(0, { instant: true });
    spy();
  }

  /* ---------- تشغيل ---------- */
  async function init() {
    const data = await loadData();
    if (!data) {
      $("#menu").innerHTML =
        '<p class="menu-error">تعذّر تحميل المنيو.<br>إذا فتحت الملف مباشرة، شغّل الموقع عبر Live Server (أو أي سيرفر محلي).</p>';
      return;
    }
    const cats = renderMenu(data);
    revealOnScroll();
    initCatBar(cats);
  }

  init();
})();
