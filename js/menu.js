/* ========== المنيو: البيانات + العرض + شريط الأقسام + البحث الهلامي + النافذة + اللغة + الوضع ========== */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const html = document.documentElement;

  const store = {
    get: (k, d = "") => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---------- حماية تلقائية: تركيب عناصر البحث والنافذة لو ناقصة في HTML ---------- */
  function ensureDOM() {
    const bar = $("#catbar");
    if (bar && !$("#searchToggle")) {
      bar.insertAdjacentHTML("beforeend", `
        <button class="catbar__search-btn" id="searchToggle" type="button" aria-expanded="false" aria-controls="searchWrap" aria-label="بحث في المنيو">
          <svg class="search-btn__icon search-btn__icon--lens" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <svg class="search-btn__icon search-btn__icon--close" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>`);
    }
    if (bar && !$("#searchWrap")) {
      bar.insertAdjacentHTML("afterend", `
        <div class="search-wrap" id="searchWrap" hidden>
          <div class="search-bar" id="searchBar">
            <span class="search-bar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input class="search-bar__input" id="searchInput" type="search" autocomplete="off" spellcheck="false" placeholder="ابحث عن وجبتك المفضلة...">
            <button class="search-bar__clear" id="searchClear" type="button" aria-label="مسح البحث" hidden>✕</button>
          </div>
          <div class="search-chips" id="searchChips"></div>
          <div class="search-suggestions" id="searchSuggestions" role="listbox" hidden></div>
        </div>`);
    }
    if (!$("#dishModal")) {
      document.body.insertAdjacentHTML("beforeend", `
        <div class="modal" id="dishModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" hidden>
          <div class="modal__backdrop" id="modalBackdrop"></div>
          <div class="modal__sheet" id="modalSheet">
            <div class="modal__handle" id="modalHandle" aria-hidden="true"><span></span></div>
            <button class="modal__close" id="modalClose" type="button" aria-label="إغلاق">✕</button>
            <div class="modal__content" id="modalContent">
              <div class="modal__media" id="modalMedia">
                <div class="modal__ph" aria-hidden="true"><span class="modal__ph-ring"></span><span class="modal__ph-icon" id="modalIcon"></span></div>
                <img class="modal__img" id="modalImg" alt="" hidden>
                <div class="modal__fade" aria-hidden="true"></div>
                <div class="modal__badges" id="modalBadges"></div>
              </div>
              <div class="modal__body">
                <div class="modal__cat" id="modalCat"></div>
                <h3 class="modal__title" id="modalTitle"></h3>
                <div class="modal__section">
                  <h4 class="modal__subtitle" id="modalIngTitle">المكونات</h4>
                  <p class="modal__desc" id="modalDesc"></p>
                </div>
                <div class="modal__allergens" id="modalAllergensBox" hidden>
                  <h4 class="modal__subtitle modal__subtitle--warn">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span id="modalAllergensTitle">مسببات الحساسية</span>
                  </h4>
                  <div class="modal__allergen-list" id="modalAllergensList"></div>
                </div>
                <div class="modal__footer">
                  <div class="modal__price-box">
                    <span class="modal__price-label" id="modalPriceLabel">السعر</span>
                    <span class="modal__price" id="modalPrice"></span>
                  </div>
                  <div class="modal__nav">
                    <button class="modal__step" id="modalPrev" type="button" aria-label="الطبق السابق"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                    <span class="modal__counter" id="modalCounter"></span>
                    <button class="modal__step" id="modalNext" type="button" aria-label="الطبق التالي"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`);
    }
  }
  ensureDOM();

  const UI = {
    ar: {
      featured: "الأكثر طلباً", spicy: "حار", vegetarian: "نباتي",
      nav: "أقسام المنيو", top: "الرجوع للأعلى", logoAlt: "شعار مطعم TAZA 041",
      title: "TAZA 041 | المنيو", langBtn: "EN", langAria: "Switch to English",
      toDark: "تفعيل الوضع الليلي", toLight: "تفعيل الوضع الصباحي",
      close: "إغلاق", priceLabel: "السعر", prevDish: "الطبق السابق", nextDish: "الطبق التالي",
      ingTitle: "المكونات", allergensTitle: "مسببات الحساسية",
      searchBtnAria: "بحث في المنيو", searchPlaceholder: "ابحث عن وجبتك، مكون، أو قسم...",
      searchClearAria: "مسح البحث", noResults: "ما لقينا طبق بهذا الاسم! جرب كلمة ثانية 🍔",
      error: "تعذّر تحميل المنيو.<br>إذا فتحت الملف مباشرة، شغّل الموقع عبر Live Server.",
    },
    en: {
      featured: "Best seller", spicy: "Spicy", vegetarian: "Vegetarian",
      nav: "Menu categories", top: "Back to top", logoAlt: "TAZA 041 logo",
      title: "TAZA 041 | Menu", langBtn: "ع", langAria: "التبديل إلى العربية",
      toDark: "Switch to dark mode", toLight: "Switch to light mode",
      close: "Close", priceLabel: "Price", prevDish: "Previous dish", nextDish: "Next dish",
      ingTitle: "Ingredients", allergensTitle: "Allergens",
      searchBtnAria: "Search menu", searchPlaceholder: "Search for a dish, ingredient...",
      searchClearAria: "Clear search", noResults: "No matching dishes found! Try another word 🍔",
      error: "Couldn't load the menu.<br>Run the site with Live Server.",
    },
  };
  const TAG_ICONS = { spicy: "🌶️", vegetarian: "🌱" };

  const ALLERGENS = {
    gluten: { ar: "غلوتين (قمح)", en: "Gluten (Wheat)", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/></svg>` },
    dairy:  { ar: "ألبان", en: "Dairy", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M5 11a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9Z"/><path d="M5 15h14"/></svg>` },
    eggs:   { ar: "بيض", en: "Eggs", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4.97 0 8-3.58 8-8.5C20 7.5 16 2 12 2S4 7.5 4 13.5C4 18.42 7.03 22 12 22Z"/><circle cx="12" cy="14" r="3"/></svg>` },
    sesame: { ar: "سمسم", en: "Sesame", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-3 3.5-4.5 7-4.5 10.5a4.5 4.5 0 1 0 9 0C16.5 10 15 6.5 12 3Z"/><circle cx="12" cy="14" r="1"/></svg>` },
    soy:    { ar: "صويا", en: "Soy", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c4.5 1.5 10-1 13-5.5S20.5 3.5 17 3c-4.5-1.5-10 1-13 5.5S1.5 18.5 5 19Z"/><circle cx="9.5" cy="13.5" r="1.5"/><circle cx="13.5" cy="9.5" r="1.5"/></svg>` },
    nuts:   { ar: "مكسرات", en: "Nuts", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7a5 5 0 0 0-7.07 0l-2.93 2.93a5 5 0 0 0 7.07 7.07L17 14.07A5 5 0 0 0 17 7Z"/><path d="m14 4 6 6"/></svg>` },
  };

  const DEFAULT_ALLERGENS_BY_ID = {
    1: [], 2: ["dairy", "gluten", "eggs"], 3: ["soy", "sesame"],
    4: ["gluten", "dairy", "sesame", "eggs"], 5: ["gluten", "eggs", "sesame"],
    6: ["gluten", "dairy", "sesame", "eggs"], 7: ["gluten", "eggs"],
    8: ["gluten", "dairy", "eggs"], 9: ["gluten", "eggs"],
    10: [], 11: [], 12: ["dairy"],
  };

  let lang = html.lang === "en" ? "en" : "ar";
  const T = () => UI[lang];
  const pick = (obj, key) => (lang === "en" && obj[key + "_en"]) || obj[key];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const price = (n, cur) => `${Number(n).toLocaleString("en-US")} ${cur}`;

  let data = null, cats = [], cards = [], orderedItems = [];

  /* ---------- عرض المنيو ---------- */
  function renderMenu() {
    const cur = pick(data.restaurant, "currency");
    cats = data.categories.filter((c) => data.items.some((i) => i.category === c.id && i.available !== false));
    orderedItems = [];

    const card = (i, c, idx) => {
      const tagsHtml = (i.tags || []).filter((tg) => TAG_ICONS[tg])
        .map((tg) => `<span class="tag" title="${esc(T()[tg])}" aria-label="${esc(T()[tg])}">${TAG_ICONS[tg]}</span>`).join("");
      return `
        <article class="dish${i.featured ? " dish--featured" : ""}" data-idx="${idx}" tabindex="0" role="button" aria-label="${esc(pick(i, "name"))}">
          <div class="dish__media">
            <div class="dish__ph" aria-hidden="true"><span class="dish__ph-icon">${esc(c.icon)}</span></div>
            ${i.image ? `<img src="${esc(i.image)}" alt="${esc(pick(i, "name"))}" loading="lazy">` : ""}
            ${i.featured ? `<span class="dish__flag">🔥 ${esc(T().featured)}</span>` : ""}
            ${tagsHtml ? `<span class="dish__tags">${tagsHtml}</span>` : ""}
            <span class="dish__price">${esc(price(i.price, cur))}</span>
          </div>
          <div class="dish__body">
            <h3 class="dish__name">${esc(pick(i, "name"))}</h3>
            <p class="dish__desc">${esc(pick(i, "description"))}</p>
          </div>
        </article>`;
    };

    $("#menu").innerHTML = cats.map((c) => {
      const items = data.items.filter((i) => i.category === c.id && i.available !== false)
        .sort((x, y) => Number(!!y.featured) - Number(!!x.featured));
      const cardsHtml = items.map((i) => {
        const idx = orderedItems.length;
        orderedItems.push({ item: i, cat: c });
        return card(i, c, idx);
      }).join("");
      return `
        <section class="menu-section" id="cat-${esc(c.id)}">
          <h2 class="menu-section__title"><span class="menu-section__icon" aria-hidden="true">${esc(c.icon)}</span>${esc(pick(c, "name"))}</h2>
          <div class="dishes">${cardsHtml}</div>
        </section>`;
    }).join("");

    $("#menu").querySelectorAll(".dish__media img").forEach((img) => img.addEventListener("error", () => img.remove()));
  }

  /* ---------- شريط البحث والاقتراحات (Jelly Pop Search) ---------- */
  const searchToggle = $("#searchToggle");
  const searchWrap = $("#searchWrap");
  const searchInput = $("#searchInput");
  const searchClear = $("#searchClear");
  const searchChips = $("#searchChips");
  const searchSuggestions = $("#searchSuggestions");

  let isSearchOpen = false;
  let activeChipFilter = "";

  function normText(str) {
    return String(str || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").trim();
  }

  function highlightText(text, query) {
    const cleanText = String(text || "");
    if (!query || query.startsWith("#")) return esc(cleanText);
    const q = query.trim();
    if (!q) return esc(cleanText);
    const idx = normText(cleanText).indexOf(normText(q));
    if (idx === -1) return esc(cleanText);
    return `${esc(cleanText.slice(0, idx))}<mark class="suggestion-item__hl">${esc(cleanText.slice(idx, idx + q.length))}</mark>${esc(cleanText.slice(idx + q.length))}`;
  }

  function renderQuickChips() {
    const chips = [
      { id: "#featured", label: `🔥 ${T().featured}` },
      { id: "#spicy", label: `🌶️ ${T().spicy}` },
      { id: "#vegetarian", label: `🌱 ${T().vegetarian}` },
      ...cats.map((c) => ({ id: pick(c, "name"), label: `${c.icon} ${pick(c, "name")}` })),
    ];
    searchChips.innerHTML = chips.map((ch, i) => `
      <button class="search-chip${activeChipFilter === ch.id ? " is-active" : ""}" type="button" data-q="${esc(ch.id)}" style="--jd:${i * 55}ms">
        ${esc(ch.label)}
      </button>`).join("");
  }

  function runSearch(rawQuery) {
    const q = normText(rawQuery);
    searchClear.hidden = !rawQuery && !activeChipFilter;

    if (!q && !activeChipFilter) {
      searchSuggestions.hidden = true;
      searchSuggestions.innerHTML = "";
      cards.forEach((c) => (c.hidden = false));
      sections.forEach((s) => s && (s.hidden = false));
      revealVisible();
      return;
    }

    const cur = pick(data.restaurant, "currency");
    const matchedIndices = [];

    orderedItems.forEach((entry, idx) => {
      const { item, cat } = entry;
      let match = false;
      if (activeChipFilter === "#featured") match = !!item.featured;
      else if (activeChipFilter === "#spicy") match = (item.tags || []).includes("spicy");
      else if (activeChipFilter === "#vegetarian") match = (item.tags || []).includes("vegetarian");
      else {
        const haystack = normText(`${item.name} ${item.name_en} ${item.description} ${item.description_en} ${cat.name} ${cat.name_en}`);
        match = haystack.includes(q);
      }
      if (match) matchedIndices.push(idx);
      if (cards[idx]) cards[idx].hidden = !match;
    });

    sections.forEach((sec) => {
      if (!sec) return;
      sec.hidden = !sec.querySelector(".dish:not([hidden])");
    });

    revealVisible();
    searchSuggestions.hidden = false;

    if (matchedIndices.length === 0) {
      searchSuggestions.innerHTML = `<div class="search-empty">${esc(T().noResults)}</div>`;
      return;
    }

    searchSuggestions.innerHTML = matchedIndices.slice(0, 6).map((idx, i) => {
      const { item, cat } = orderedItems[idx];
      const badges = [item.featured ? "🔥" : "", ...(item.tags || []).map((t) => TAG_ICONS[t] || "")].filter(Boolean).join(" ");
      return `
        <button class="suggestion-item" type="button" role="option" data-idx="${idx}" style="--jd:${i * 60}ms">
          <span class="suggestion-item__icon" aria-hidden="true">${esc(cat.icon)}</span>
          <div class="suggestion-item__info">
            <h4 class="suggestion-item__name">${highlightText(pick(item, "name"), rawQuery)} ${badges}</h4>
            <div class="suggestion-item__meta"><span>${esc(pick(cat, "name"))}</span><span>•</span><span>${esc(pick(item, "description"))}</span></div>
          </div>
          <span class="suggestion-item__price">${esc(price(item.price, cur))}</span>
        </button>`;
    }).join("");
  }

  function openSearch() {
    if (isSearchOpen) return;
    isSearchOpen = true;
    searchToggle.classList.add("is-active");
    searchToggle.setAttribute("aria-expanded", "true");
    renderQuickChips();
    searchWrap.hidden = false;
    searchWrap.classList.remove("is-closing");
    void searchWrap.offsetWidth;
    searchWrap.classList.add("is-open");
    setTimeout(() => searchInput.focus(), 120);
  }

  function closeSearch() {
    if (!isSearchOpen) return;
    isSearchOpen = false;
    searchToggle.classList.remove("is-active");
    searchToggle.setAttribute("aria-expanded", "false");
    searchWrap.classList.remove("is-open");
    searchWrap.classList.add("is-closing");
    searchInput.value = "";
    activeChipFilter = "";
    runSearch("");
    setTimeout(() => {
      if (!isSearchOpen) {
        searchWrap.hidden = true;
        searchWrap.classList.remove("is-closing");
      }
    }, 260);
  }

  searchToggle.addEventListener("click", () => (isSearchOpen ? closeSearch() : openSearch()));
  searchInput.addEventListener("input", () => {
    activeChipFilter = "";
    searchChips.querySelectorAll(".search-chip").forEach((b) => b.classList.remove("is-active"));
    runSearch(searchInput.value);
  });
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    activeChipFilter = "";
    searchChips.querySelectorAll(".search-chip").forEach((b) => b.classList.remove("is-active"));
    runSearch("");
    searchInput.focus();
  });
  searchChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".search-chip");
    if (!chip) return;
    const q = chip.dataset.q;
    if (activeChipFilter === q) {
      activeChipFilter = "";
      searchInput.value = "";
      chip.classList.remove("is-active");
      runSearch("");
      return;
    }
    searchChips.querySelectorAll(".search-chip").forEach((b) => b.classList.remove("is-active"));
    chip.classList.add("is-active");
    if (q.startsWith("#")) {
      activeChipFilter = q;
      searchInput.value = "";
      runSearch(q);
    } else {
      activeChipFilter = "";
      searchInput.value = q;
      runSearch(q);
    }
  });
  searchSuggestions.addEventListener("click", (e) => {
    const itemBtn = e.target.closest(".suggestion-item");
    if (!itemBtn) return;
    openModal(Number(itemBtn.dataset.idx), itemBtn);
  });

  /* ---------- نافذة تفاصيل الطبق (Dish Modal) ---------- */
  const modal = $("#dishModal"), modalSheet = $("#modalSheet"), modalContent = $("#modalContent"),
    modalMedia = $("#modalMedia"), modalBackdrop = $("#modalBackdrop"), modalClose = $("#modalClose"),
    modalImg = $("#modalImg"), modalIcon = $("#modalIcon"), modalBadges = $("#modalBadges"),
    modalCat = $("#modalCat"), modalTitle = $("#modalTitle"), modalIngTitle = $("#modalIngTitle"),
    modalDesc = $("#modalDesc"), modalAllergensBox = $("#modalAllergensBox"),
    modalAllergensTitle = $("#modalAllergensTitle"), modalAllergensList = $("#modalAllergensList"),
    modalPrice = $("#modalPrice"), modalPriceLabel = $("#modalPriceLabel"),
    modalPrev = $("#modalPrev"), modalNext = $("#modalNext"), modalCounter = $("#modalCounter");

  let currentModalIdx = -1, lastFocusedCard = null;

  function buildSpicyBadgeHtml(delaySec) {
    const dirSign = lang === "ar" ? -1 : 1;
    return `
      <span class="modal__badge modal__badge--spicy" style="--bd:${delaySec}s">
        <span class="chili-stage" aria-hidden="true">
          <span class="chili-stage__pepper">🌶️</span>
          <svg class="chili-stage__flame" viewBox="0 0 64 36">
            <path d="M2 18 Q 18 3, 40 9 T 62 18 Q 42 33, 20 27 Z" fill="#ff3b00" opacity="0.92"/>
            <path d="M4 18 Q 18 9, 34 13 T 50 18 Q 34 27, 18 23 Z" fill="#ff9e00"/>
            <path d="M5 18 Q 14 13, 25 16 T 35 18 Q 25 23, 14 20 Z" fill="#fff394"/>
          </svg>
          <span class="chili-stage__spark" style="--sd:0.52s;--sx1:${14 * dirSign}px;--sy1:-6px;--sx2:${44 * dirSign}px;--sy2:-18px"></span>
          <span class="chili-stage__spark" style="--sd:0.64s;--sx1:${18 * dirSign}px;--sy1:5px;--sx2:${52 * dirSign}px;--sy2:12px"></span>
          <span class="chili-stage__spark" style="--sd:0.76s;--sx1:${12 * dirSign}px;--sy1:-2px;--sx2:${38 * dirSign}px;--sy2:4px"></span>
        </span>
        <span>${esc(T().spicy)}</span>
      </span>`;
  }

  function populateModal(idx, slideDir = "") {
    const entry = orderedItems[idx];
    if (!entry) return;
    currentModalIdx = idx;
    const { item, cat } = entry;
    const cur = pick(data.restaurant, "currency");

    if (slideDir) {
      modalContent.classList.remove("slide-next", "slide-prev");
      void modalContent.offsetWidth;
      modalContent.classList.add(slideDir === "next" ? "slide-next" : "slide-prev");
    }

    modalIcon.textContent = cat.icon;
    if (item.image) {
      modalImg.src = item.image;
      modalImg.alt = pick(item, "name");
      modalImg.hidden = false;
      modalImg.onerror = () => { modalImg.hidden = true; };
    } else {
      modalImg.hidden = true;
      modalImg.removeAttribute("src");
    }

    const isSpicy = (item.tags || []).includes("spicy");
    modalMedia.classList.remove("is-spicy-burst");
    if (isSpicy) {
      void modalMedia.offsetWidth;
      modalMedia.classList.add("is-spicy-burst");
    }

    const badges = [];
    if (item.featured) badges.push(`<span class="modal__badge modal__badge--featured" style="--bd:0.12s">🔥 ${esc(T().featured)}</span>`);
    (item.tags || []).forEach((tg, i) => {
      const delay = (0.18 + i * 0.06).toFixed(2);
      if (tg === "spicy") badges.push(buildSpicyBadgeHtml(delay));
      else if (TAG_ICONS[tg]) badges.push(`<span class="modal__badge" style="--bd:${delay}s">${TAG_ICONS[tg]} ${esc(T()[tg])}</span>`);
    });
    modalBadges.innerHTML = badges.join("");

    modalCat.textContent = `${cat.icon} ${pick(cat, "name")}`;
    modalTitle.textContent = pick(item, "name");
    modalIngTitle.textContent = T().ingTitle;
    modalDesc.textContent = pick(item, "description");

    const rawAllergens = Array.isArray(item.allergens) ? item.allergens : (DEFAULT_ALLERGENS_BY_ID[item.id] || []);
    const itemAllergens = rawAllergens.filter((key) => ALLERGENS[key]);

    if (itemAllergens.length > 0) {
      modalAllergensTitle.textContent = T().allergensTitle;
      modalAllergensList.innerHTML = itemAllergens.map((key, i) => {
        const al = ALLERGENS[key];
        return `<span class="allergen-chip" style="--ad:${0.26 + i * 0.05}s"><span class="allergen-chip__icon" aria-hidden="true">${al.svg}</span><span>${esc(al[lang])}</span></span>`;
      }).join("");
      modalAllergensBox.hidden = false;
    } else {
      modalAllergensBox.hidden = true;
      modalAllergensList.innerHTML = "";
    }

    modalPriceLabel.textContent = T().priceLabel;
    modalPrice.textContent = price(item.price, cur);
    modalCounter.textContent = `${idx + 1} / ${orderedItems.length}`;
  }

  function openModal(idx, cardEl) {
    if (!orderedItems[idx]) return;
    lastFocusedCard = cardEl || null;
    if (cardEl) {
      const r = cardEl.getBoundingClientRect();
      modalSheet.style.setProperty("--origin-x", `${(((r.left + r.width / 2) / window.innerWidth) * 100).toFixed(1)}%`);
      modalSheet.style.setProperty("--origin-y", `${(((r.top + r.height / 2) / window.innerHeight) * 100).toFixed(1)}%`);
    }
    populateModal(idx);
    modalSheet.style.transform = "";
    modal.hidden = false;
    modal.classList.remove("is-closing");
    void modal.offsetWidth;
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    modalClose.focus({ preventScroll: true });
  }

  function closeModal() {
    if (modal.hidden || modal.classList.contains("is-closing")) return;
    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    document.body.classList.remove("modal-open");
    setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove("is-closing");
      modalSheet.style.transform = "";
      if (lastFocusedCard) lastFocusedCard.focus({ preventScroll: true });
    }, 280);
  }

  function stepModal(delta) {
    if (!orderedItems.length) return;
    const nextIdx = (currentModalIdx + delta + orderedItems.length) % orderedItems.length;
    populateModal(nextIdx, delta > 0 ? "next" : "prev");
  }

  $("#menu").addEventListener("click", (e) => {
    const cardEl = e.target.closest(".dish");
    if (cardEl) openModal(Number(cardEl.dataset.idx), cardEl);
  });
  $("#menu").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const cardEl = e.target.closest(".dish");
    if (cardEl) { e.preventDefault(); openModal(Number(cardEl.dataset.idx), cardEl); }
  });

  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  modalPrev.addEventListener("click", () => stepModal(-1));
  modalNext.addEventListener("click", () => stepModal(1));

  window.addEventListener("keydown", (e) => {
    if (!modal.hidden) {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") stepModal(lang === "ar" ? 1 : -1);
      else if (e.key === "ArrowRight") stepModal(lang === "ar" ? -1 : 1);
      return;
    }
    if (isSearchOpen && e.key === "Escape") closeSearch();
  });

  let touchStartX = 0, touchStartY = 0, touchDeltaX = 0, touchDeltaY = 0, isDraggingSheet = false;
  modalSheet.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0; touchDeltaY = 0;
    isDraggingSheet = true;
    modalSheet.style.transition = "none";
  }, { passive: true });

  modalSheet.addEventListener("touchmove", (e) => {
    if (!isDraggingSheet) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
    touchDeltaY = e.touches[0].clientY - touchStartY;
    if (touchDeltaY > 0 && Math.abs(touchDeltaY) > Math.abs(touchDeltaX) && modalSheet.scrollTop <= 0) {
      modalSheet.style.transform = `translateY(${Math.pow(touchDeltaY, 0.88)}px)`;
    }
  }, { passive: true });

  modalSheet.addEventListener("touchend", () => {
    if (!isDraggingSheet) return;
    isDraggingSheet = false;
    modalSheet.style.transition = "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)";
    if (touchDeltaY > 95 && Math.abs(touchDeltaY) > Math.abs(touchDeltaX) && modalSheet.scrollTop <= 0) {
      closeModal(); return;
    }
    if (Math.abs(touchDeltaX) > 65 && Math.abs(touchDeltaX) > Math.abs(touchDeltaY) * 1.3) {
      const dir = touchDeltaX < 0 ? 1 : -1;
      stepModal(lang === "ar" ? -dir : dir);
    }
    modalSheet.style.transform = "";
  });

  /* ---------- ظهور البطاقات مع السكرول ---------- */
  let scrollDir = "down", locked = false;

  function reveal(card, i = 0) {
    if (card.classList.contains("is-in")) return;
    card.dataset.from = scrollDir === "up" ? "up" : "down";
    card.style.setProperty("--d", Math.min(i, 5) * 70 + "ms");
    card.classList.add("is-in");
  }

  function revealVisible() {
    cards.filter((c) => {
      if (c.hidden) return false;
      const r = c.getBoundingClientRect();
      return r.top < innerHeight * 0.92 && r.bottom > 0;
    }).forEach((c, i) => reveal(c, i));
  }

  const hasIO = "IntersectionObserver" in window;
  const enterIO = hasIO && new IntersectionObserver((entries) => {
    if (locked) return;
    entries.filter((e) => e.isIntersecting).forEach((e, i) => reveal(e.target, i));
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  const leaveIO = hasIO && new IntersectionObserver((entries) => {
    entries.forEach((e) => !e.isIntersecting && e.target.classList.remove("is-in"));
  }, { threshold: 0 });

  function observeCards() {
    cards = [...document.querySelectorAll(".dish")];
    if (!hasIO) return;
    enterIO.disconnect();
    leaveIO.disconnect();
    $("#menu").classList.add("js-reveal");
    cards.forEach((c) => { enterIO.observe(c); leaveIO.observe(c); });
  }

  /* ---------- شريط الأقسام المثبت + السكرول الصاروخي ---------- */
  const bar = $("#catbar"), track = $("#catTrack"), inner = $("#catInner"), pill = $("#catPill");
  let buttons = [], sections = [], active = -1, flight = {}, scrollAnimId = null;

  function movePill(btn, animate) {
    if (!animate) pill.style.transition = "none";
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = `translateX(${btn.offsetLeft}px)`;
    if (!animate) { void pill.offsetWidth; pill.style.transition = ""; }
  }

  function centerButton(btn) {
    const b = btn.getBoundingClientRect(), t = track.getBoundingClientRect();
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
    if (i === active || !buttons[i]) return;
    active = i;
    buttons.forEach((b, j) => {
      b.classList.toggle("is-active", j === i);
      b.setAttribute("aria-current", j === i ? "true" : "false");
    });
    movePill(buttons[i], !instant);
    centerButton(buttons[i]);
  }

  function cancelFlight() {
    if (scrollAnimId) { cancelAnimationFrame(scrollAnimId); scrollAnimId = null; }
    if (flight.anim) flight.anim.cancel();
    if (flight.el) flight.el.remove();
    if (flight.icon) flight.icon.style.visibility = "";
    $("#menu").classList.remove("is-warping-down", "is-warping-up");
    flight = {}; locked = false;
  }

  function flyToTarget(btn, titleIcon, duration, targetScrollY) {
    const from = $(".cat__icon", btn);
    const a = from.getBoundingClientRect(), b = titleIcon.getBoundingClientRect();
    const scrollDelta = targetScrollY - window.scrollY;
    const finalTop = b.top - scrollDelta, finalLeft = b.left;
    const fromSize = parseFloat(getComputedStyle(from).fontSize);
    const scale = parseFloat(getComputedStyle(titleIcon).fontSize) / fromSize;
    const dx = finalLeft - a.left, dy = finalTop - a.top;

    const el = document.createElement("span");
    el.className = "fly";
    el.setAttribute("aria-hidden", "true");
    el.textContent = from.textContent;
    el.style.cssText = `left:${a.left}px;top:${a.top}px;font-size:${fromSize}px`;
    document.body.append(el);

    const arcY = scrollDelta >= 0 ? -55 : 45;
    const anim = el.animate([
      { transform: "translate(0, 0) scale(1) rotate(0deg)" },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 + arcY}px) scale(${scale * 1.35}) rotate(${scrollDelta >= 0 ? -18 : 18}deg)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(0deg)` },
    ], { duration, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" });

    flight = { el, icon: titleIcon, anim };
    anim.onfinish = () => {
      el.remove();
      titleIcon.style.visibility = "";
      titleIcon.classList.remove("pop");
      void titleIcon.offsetWidth;
      titleIcon.classList.add("pop");
      flight = {};
    };
  }

  function goTo(i) {
    if (isSearchOpen) closeSearch();
    if (!sections[i]) return;
    cancelFlight();
    locked = true;
    setActive(i);
    pulseIcon(buttons[i]);

    const sec = sections[i], icon = $(".menu-section__icon", sec), menuEl = $("#menu");
    const startY = window.scrollY, offset = bar.offsetHeight + 8;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = Math.max(0, Math.min(startY + sec.getBoundingClientRect().top - offset, maxScroll));
    const distance = targetY - startY;

    if (Math.abs(distance) < 8) {
      locked = false;
      icon.classList.remove("pop");
      void icon.offsetWidth;
      icon.classList.add("pop");
      return;
    }

    scrollDir = distance > 0 ? "down" : "up";
    const duration = Math.min(750, Math.max(450, Math.abs(distance) * 0.38));

    icon.style.visibility = "hidden";
    flyToTarget(buttons[i], icon, duration, targetY);

    menuEl.classList.add(distance > 0 ? "is-warping-down" : "is-warping-up");
    setTimeout(() => menuEl.classList.remove("is-warping-down", "is-warping-up"), duration * 0.72);

    const startTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) scrollAnimId = requestAnimationFrame(step);
      else { scrollAnimId = null; locked = false; lastY = window.scrollY; revealVisible(); }
    }
    scrollAnimId = requestAnimationFrame(step);
  }

  ["wheel", "touchmove"].forEach((evt) =>
    window.addEventListener(evt, () => { if (locked) cancelFlight(); }, { passive: true })
  );

  function buildNav(keepId) {
    inner.querySelectorAll(".cat").forEach((b) => b.remove());
    inner.insertAdjacentHTML("beforeend", cats.map((c) => `
      <button class="cat" type="button" data-cat="${esc(c.id)}">
        <span class="cat__icon" aria-hidden="true">${esc(c.icon)}</span>
        <span class="cat__name">${esc(pick(c, "name"))}</span>
      </button>`).join(""));
    buttons = [...inner.querySelectorAll(".cat")];
    sections = buttons.map((b) => document.getElementById("cat-" + b.dataset.cat));
    buttons.forEach((btn, i) => btn.addEventListener("click", () => goTo(i)));
    active = -1;
    setActive(Math.max(0, cats.findIndex((c) => c.id === keepId)), { instant: true });
    bar.hidden = false;
  }

  let ticking = false, lastY = scrollY;
  function spy() {
    ticking = false;
    if (locked || !sections.length) return;
    const line = bar.offsetHeight + 24;
    let idx = 0;
    sections.forEach((s, i) => { if (!s.hidden && s.getBoundingClientRect().top <= line) idx = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) idx = sections.length - 1;
    setActive(idx);
  }

  addEventListener("scroll", () => {
    if (locked) return;
    const y = scrollY;
    if (Math.abs(y - lastY) > 1) { scrollDir = y > lastY ? "down" : "up"; lastY = y; }
    if (!ticking) { ticking = true; requestAnimationFrame(spy); }
  }, { passive: true });

  new IntersectionObserver(
    ([e]) => bar.classList.toggle("is-stuck", !e.isIntersecting && e.boundingClientRect.top < 0),
    { threshold: 0 }
  ).observe($("#catSentinel"));

  $("#catLogo").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  const replacePill = () => active >= 0 && movePill(buttons[active], false);
  new ResizeObserver(replacePill).observe(inner);
  new ResizeObserver(replacePill).observe(track);
  document.fonts && document.fonts.ready.then(replacePill);

  /* ---------- اللغة والوضع ---------- */
  function updateThemeBtn() {
    const dark = html.dataset.theme === "dark";
    $("#themeBtn").setAttribute("aria-label", dark ? T().toLight : T().toDark);
  }

  function updateStatic() {
    const s = T();
    document.title = s.title;
    bar.setAttribute("aria-label", s.nav);
    $("#catLogo").setAttribute("aria-label", s.top);
    $(".brand__logo").alt = s.logoAlt;
    $("#langLabel").textContent = s.langBtn;
    $("#langBtn").setAttribute("aria-label", s.langAria);
    modalClose.setAttribute("aria-label", s.close);
    modalPrev.setAttribute("aria-label", s.prevDish);
    modalNext.setAttribute("aria-label", s.nextDish);
    searchToggle.setAttribute("aria-label", s.searchBtnAria);
    searchInput.placeholder = s.searchPlaceholder;
    searchClear.setAttribute("aria-label", s.searchClearAria);
    updateThemeBtn();
  }

  function applyLang(next) {
    cancelFlight();
    lang = next;
    store.set("taza-lang", next);
    html.lang = next;
    html.dir = next === "ar" ? "rtl" : "ltr";
    const keep = cats[active] && cats[active].id;
    updateStatic();
    if (!data) return;
    renderMenu();
    buildNav(keep);
    observeCards();
    if (isSearchOpen) {
      renderQuickChips();
      runSearch(activeChipFilter || searchInput.value);
    }
    if (!modal.hidden && currentModalIdx >= 0) populateModal(currentModalIdx);
  }

  function switchLang() {
    const next = lang === "ar" ? "en" : "ar";
    if (document.startViewTransition) document.startViewTransition(() => applyLang(next));
    else applyLang(next);
  }

  function setTheme(next, cx, cy) {
    const apply = () => { html.dataset.theme = next; store.set("taza-theme", next); updateThemeBtn(); };
    if (!document.startViewTransition) return apply();
    html.classList.add("vt-theme");
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      const r = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      html.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${r}px at ${cx}px ${cy}px)`] },
        { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(() => {});
    vt.finished.finally(() => html.classList.remove("vt-theme"));
  }

  $("#themeBtn").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTheme(html.dataset.theme === "dark" ? "light" : "dark", r.left + r.width / 2, r.top + r.height / 2);
  });
  $("#langBtn").addEventListener("click", switchLang);

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!store.get("taza-theme")) { html.dataset.theme = e.matches ? "dark" : "light"; updateThemeBtn(); }
  });

  /* ---------- تشغيل ---------- */
  async function init() {
    updateStatic();
    try {
      const res = await fetch("data/menu.json?v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
    } catch (err) {
      $("#menu").innerHTML = `<p class="menu-error">${T().error}</p>`;
      return;
    }
    renderMenu();
    buildNav();
    observeCards();
    spy();
  }

  init();
})();
