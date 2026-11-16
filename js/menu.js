/* ========== المنيو: البيانات + العرض + شريط الأقسام + البحث الهلامي + النافذة + اللغة + الوضع ========== */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const html = document.documentElement;

  const store = {
    get: (k, d = "") => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---------- النصوص الثابتة باللغتين ---------- */
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
      error: "تعذّر تحميل المنيو.<br>إذا فتحت الملف مباشرة، شغّل الموقع عبر Live Server (أو أي سيرفر محلي).",
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
      error: "Couldn't load the menu.<br>If you opened the file directly, run the site with Live Server (or any local server).",
    },
  };
  const TAG_ICONS = { spicy: "🌶️", vegetarian: "🌱" };

  /* ---------- قاموس مسببات الحساسية ---------- */
  const ALLERGENS = {
    gluten: {
      ar: "غلوتين (قمح)", en: "Gluten (Wheat)",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/></svg>`,
    },
    dairy: {
      ar: "ألبان", en: "Dairy",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M5 11a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9Z"/><path d="M5 15h14"/></svg>`,
    },
    eggs: {
      ar: "بيض", en: "Eggs",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4.97 0 8-3.58 8-8.5C20 7.5 16 2 12 2S4 7.5 4 13.5C4 18.42 7.03 22 12 22Z"/><circle cx="12" cy="14" r="3"/></svg>`,
    },
    sesame: {
      ar: "سمسم", en: "Sesame",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-3 3.5-4.5 7-4.5 10.5a4.5 4.5 0 1 0 9 0C16.5 10 15 6.5 12 3Z"/><circle cx="12" cy="14" r="1"/></svg>`,
    },
    soy: {
      ar: "صويا", en: "Soy",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c4.5 1.5 10-1 13-5.5S20.5 3.5 17 3c-4.5-1.5-10 1-13 5.5S1.5 18.5 5 19Z"/><circle cx="9.5" cy="13.5" r="1.5"/><circle cx="13.5" cy="9.5" r="1.5"/></svg>`,
    },
    nuts: {
      ar: "مكسرات", en: "Nuts",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7a5 5 0 0 0-7.07 0l-2.93 2.93a5 5 0 0 0 7.07 7.07L17 14.07A5 5 0 0 0 17 7Z"/><path d="m14 4 6 6"/></svg>`,
    },
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
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const price = (n, cur) => `${Number(n).toLocaleString("en-US")} ${cur}`;

  let data = null;
  let cats = [];
  let cards = [];
  let orderedItems = [];

  /* ======================================================
     عرض الأقسام والبطاقات
  ====================================================== */
  function renderMenu() {
    const cur = pick(data.restaurant, "currency");
    cats = data.categories.filter((c) => data.items.some((i) => i.category === c.id && i.available !== false));
    orderedItems = [];

    const card = (i, c, idx) => {
      const tagsHtml = (i.tags || [])
        .filter((tg) => TAG_ICONS[tg])
        .map((tg) => `<span class="tag" title="${esc(T()[tg])}" aria-label="${esc(T()[tg])}">${TAG_ICONS[tg]}</span>`)
        .join("");
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

    $("#menu").innerHTML = cats
      .map((c) => {
        const items = data.items
          .filter((i) => i.category === c.id && i.available !== false)
          .sort((x, y) => Number(!!y.featured) - Number(!!x.featured));

        const cardsHtml = items
          .map((i) => {
            const idx = orderedItems.length;
            orderedItems.push({ item: i, cat: c });
            return card(i, c, idx);
          })
          .join("");

        return `
      <section class="menu-section" id="cat-${esc(c.id)}">
        <h2 class="menu-section__title"><span class="menu-section__icon" aria-hidden="true">${esc(c.icon)}</span>${esc(pick(c, "name"))}</h2>
        <div class="dishes">${cardsHtml}</div>
      </section>`;
      })
      .join("");

    $("#menu").querySelectorAll(".dish__media img").forEach((img) =>
      img.addEventListener("error", () => img.remove())
    );
  }

  /* ======================================================
     شريط البحث والاقتراحات (Jelly Pop Search)
  ====================================================== */
  const searchToggle = $("#searchToggle");
  const searchWrap = $("#searchWrap");
  const searchInput = $("#searchInput");
  const searchClear = $("#searchClear");
  const searchChips = $("#searchChips");
  const searchSuggestions = $("#searchSuggestions");

  let isSearchOpen = false;
  let activeChipFilter = "";

  function normText(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();
  }

  function highlightText(text, query) {
    const cleanText = String(text || "");
    if (!query || query.startsWith("#")) return esc(cleanText);
    const q = query.trim();
    if (!q) return esc(cleanText);
    const idx = normText(cleanText).indexOf(normText(q));
    if (idx === -1) return esc(cleanText);
    const before = cleanText.slice(0, idx);
    const match = cleanText.slice(idx, idx + q.length);
    const after = cleanText.slice(idx + q.length);
    return `${esc(before)}<mark class="suggestion-item__hl">${esc(match)}</mark>${esc(after)}`;
  }

  function renderQuickChips() {
    const chips = [
      { id: "#featured", label: `🔥 ${T().featured}` },
      { id: "#spicy", label: `🌶️ ${T().spicy}` },
      { id: "#vegetarian", label: `🌱 ${T().vegetarian}` },
      ...cats.map((c) => ({ id: pick(c, "name"), label: `${c.icon} ${pick(c, "name")}` })),
    ];

    searchChips.innerHTML = chips
      .map(
        (ch, i) => `
      <button class="search-chip${activeChipFilter === ch.id ? " is-active" : ""}" type="button" data-q="${esc(ch.id)}" style="--jd:${i * 55}ms">
        ${esc(ch.label)}
      </button>`
      )
      .join("");
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

      if (activeChipFilter === "#featured") {
        match = !!item.featured;
      } else if (activeChipFilter === "#spicy") {
        match = (item.tags || []).includes("spicy");
      } else if (activeChipFilter === "#vegetarian") {
        match = (item.tags || []).includes("vegetarian");
      } else {
        const haystack = normText(
          `${item.name} ${item.name_en} ${item.description} ${item.description_en} ${cat.name} ${cat.name_en}`
        );
        match = haystack.includes(q);
      }

      if (match) matchedIndices.push(idx);
      if (cards[idx]) cards[idx].hidden = !match;
    });

    sections.forEach((sec) => {
      if (!sec) return;
      const hasVisible = sec.querySelector(".dish:not([hidden])");
      sec.hidden = !hasVisible;
    });

    revealVisible();

    searchSuggestions.hidden = false;
    if (matchedIndices.length === 0) {
      searchSuggestions.innerHTML = `<div class="search-empty">${esc(T().noResults)}</div>`;
      return;
    }

    searchSuggestions.innerHTML = matchedIndices
      .slice(0, 6)
      .map((idx, i) => {
        const { item, cat } = orderedItems[idx];
        const badges = [
          item.featured ? "🔥" : "",
          ...(item.tags || []).map((t) => TAG_ICONS[t] || ""),
        ]
          .filter(Boolean)
          .join(" ");

        return `
        <button class="suggestion-item" type="button" role="option" data-idx="${idx}" style="--jd:${i * 60}ms">
          <span class="suggestion-item__icon" aria-hidden="true">${esc(cat.icon)}</span>
          <div class="suggestion-item__info">
            <h4 class="suggestion-item__name">${highlightText(pick(item, "name"), rawQuery)} ${badges}</h4>
            <div class="suggestion-item__meta">
              <span>${esc(pick(cat, "name"))}</span>
              <span>•</span>
              <span>${esc(pick(item, "description"))}</span>
            </div>
          </div>
          <span class="suggestion-item__price">${esc(price(item.price, cur))}</span>
        </button>`;
      })
      .join("");
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

  searchToggle.addEventListener("click", () => {
    if (isSearchOpen) closeSearch();
    else openSearch();
  });

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
    const idx = Number(itemBtn.dataset.idx);
    openModal(idx, itemBtn);
  });

  /* ======================================================
     نافذة تفاصيل الطبق (Dish Modal)
  ====================================================== */
  const modal = $("#dishModal");
  const modalSheet = $("#modalSheet");
  const modalContent = $("#modalContent");
  const modalMedia = $("#modalMedia");
  const modalBackdrop = $("#modalBackdrop");
  const modalClose = $("#modalClose");
  const modalImg = $("#modalImg");
  const modalIcon = $("#modalIcon");
  const modalBadges = $("#modalBadges");
  const modalCat = $("#modalCat");
  const modalTitle = $("#modalTitle");
  const modalIngTitle = $("#modalIngTitle");
  const modalDesc = $("#modalDesc");
  const modalAllergensBox = $("#modalAllergensBox");
  const modalAllergensTitle = $("#modalAllergensTitle");
  const modalAllergensList = $("#modalAllergensList");
  const modalPrice = $("#modalPrice");
  const modalPriceLabel = $("#modalPriceLabel");
  const modalPrev = $("#modalPrev");
  const modalNext = $("#modalNext");
  const modalCounter = $("#modalCounter");

  let currentModalIdx = -1;
  let lastFocusedCard = null;

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
    if (item.featured) {
      badges.push(`<span class="modal__badge modal__badge--featured" style="--bd:0.12s">🔥 ${esc(T().featured)}</span>`);
    }
    (item.tags || []).forEach((tg, i) => {
      const delay = (0.18 + i * 0.06).toFixed(2);
      if (tg === "spicy") {
        badges.push(buildSpicyBadgeHtml(delay));
      } else if (TAG_ICONS[tg]) {
        badges.push(
          `<span class="modal__badge" style="--bd:${delay}s">${TAG_ICONS[tg]} ${esc(T()[tg])}</span>`
        );
      }
    });
    modalBadges.innerHTML = badges.join("");

    modalCat.textContent = `${cat.icon} ${pick(cat, "name")}`;
    modalTitle.textContent = pick(item, "name");
    modalIngTitle.textContent = T().ingTitle;
    modalDesc.textContent = pick(item, "description");

    const rawAllergens = Array.isArray(item.allergens)
      ? item.allergens
      : (DEFAULT_ALLERGENS_BY_ID[item.id] || []);
    const itemAllergens = rawAllergens.filter((key) => ALLERGENS[key]);

    if (itemAllergens.length > 0) {
      modalAllergensTitle.textContent = T().allergensTitle;
      modalAllergensList.innerHTML = itemAllergens
        .map((key, i) => {
          const al = ALLERGENS[key];
          return `
            <span class="allergen-chip" style="--ad:${0.26 + i * 0.05}s">
              <span class="allergen-chip__icon" aria-hidden="true">${al.svg}</span>
              <span>${esc(al[lang])}</span>
            </span>`;
        })
        .join("");
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
      const ox = ((r.left + r.width / 2) / window.innerWidth) * 100;
      const oy = ((r.top + r.height / 2) / window.innerHeight) * 100;
      modalSheet.style.setProperty("--origin-x", `${ox.toFixed(1)}%`);
      modalSheet.style.setProperty("--origin-y", `${oy.toFixed(1)}%`);
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
    if (!cardEl) return;
    openModal(Number(cardEl.dataset.idx), cardEl);
  });

  $("#menu").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const cardEl = e.target.closest(".dish");
    if (!cardEl) return;
    e.preventDefault();
    openModal(Number(cardEl.dataset.idx), cardEl);
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
    if (isSearchOpen && e.key === "Escape") {
      closeSearch();
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;
  let isDraggingSheet = false;

  modalSheet.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    touchDeltaY = 0;
    isDraggingSheet = true;
    modalSheet.style.transition = "none";
  }, { passive: true });

  modalSheet.addEventListener("touchmove", (e) => {
    if (!isDraggingSheet) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
    touchDeltaY = e.touches[0].clientY - touchStartY;

    if (touchDeltaY > 0 && Math.abs(touchDeltaY) > Math.abs(touchDeltaX) && modalSheet.scrollTop <= 0) {
      const resist = Math.pow(touchDeltaY, 0.88);
      modalSheet.style.transform = `translateY(${resist}px)`;
    }
  }, { passive: true });

  modalSheet.addEventListener("touchend", () => {
    if (!isDraggingSheet) return;
    isDraggingSheet = false;
    modalSheet.style.transition = "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)";

    if (touchDeltaY > 95 && Math.abs(touchDeltaY) > Math.abs(touchDeltaX) && modalSheet.scrollTop <= 0) {
      closeModal();
      return;
    }

    if (Math.abs(touchDeltaX) > 65 && Math.abs(touchDeltaX) > Math.abs(touchDeltaY) * 1.3) {
      const dir = touchDeltaX < 0 ? 1 : -1;
      stepModal(lang === "ar" ? -dir : dir);
    }

    modalSheet.style.transform = "";
  });

  /* ======================================================
     الأطباق تروح وتجي: تظهر وهي داخلة وتنمسح وهي طالعة
  ====================================================== */
  let scrollDir = "down";
  let locked = false;

  function reveal(card, i = 0) {
    if (card.classList.contains("is-in")) return;
    card.dataset.from = scrollDir === "up" ? "up" : "down";
    card.style.setProperty("--d", Math.min(i, 5) * 70 + "ms");
    card.classList.add("is-in");
  }

  function revealVisible() {
    cards
      .filter((c) => {
        if (c.hidden) return false;
        const r = c.getBoundingClientRect();
        return r.top < innerHeight * 0.92 && r.bottom > 0;
      })
      .forEach((c, i) => reveal(c, i));
  }

  const hasIO = "IntersectionObserver" in window;
  const enterIO =
    hasIO &&
    new IntersectionObserver(
      (entries) => {
        if (locked) return;
        entries.filter((e) => e.isIntersecting).forEach((e, i) => reveal(e.target, i));
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
  const leaveIO =
    hasIO &&
    new IntersectionObserver(
      (entries) => entries.forEach((e) => !e.isIntersecting && e.target.classList.remove("is-in")),
      { threshold: 0 }
    );

  function observeCards() {
    cards = [...document.querySelectorAll(".dish")];
    if (!hasIO) return;
    enterIO.disconnect();
    leaveIO.disconnect();
    $("#menu").classList.add("js-reveal");
    cards.forEach((c) => {
      enterIO.observe(c);
      leaveIO.observe(c);
    });
  }

  /* ======================================================
     شريط الأقسام المثبت
  ====================================================== */
  const bar = $("#catbar");
  const track = $("#catTrack");
  const inner = $("#catInner");
  const pill = $("#catPill");

  let buttons = [];
  let sections = [];
  let active = -1;
  let flight = {};
  let scrollAnimId = null;

  function movePill(btn, animate) {
    if (!animate) pill.style.transition = "none";
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = `translateX(${btn.offsetLeft}px)`;
    if (!animate) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  }

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
    if (scrollAnimId) {
      cancelAnimationFrame(scrollAnimId);
      scrollAnimId = null;
    }
    if (flight.anim) flight.anim.cancel();
    if (flight.el) flight.el.remove();
    if (flight.icon) flight.icon.style.visibility = "";
    $("#menu").classList.remove("is-warping-down", "is-warping-up");
    flight = {};
    locked = false;
  }

  function flyToTarget(btn, titleIcon, duration, targetScrollY) {
    const from = $(".cat__icon", btn);
    const a = from.getBoundingClientRect();
    const b = titleIcon.getBoundingClientRect();

    const scrollDelta = targetScrollY - window.scrollY;
    const finalTop = b.top - scrollDelta;
    const finalLeft = b.left;

    const fromSize = parseFloat(getComputedStyle(from).fontSize);
    const scale = parseFloat(getComputedStyle(titleIcon).fontSize) / fromSize;
    const dx = finalLeft - a.left;
    const dy = finalTop - a.top;

    const el = document.createElement("span");
    el.className = "fly";
    el.setAttribute("aria-hidden", "true");
    el.textContent = from.textContent;
    el.style.cssText = `left:${a.left}px;top:${a.top}px;font-size:${fromSize}px`;
    document.body.append(el);

    const arcY = scrollDelta >= 0 ? -55 : 45;

    const anim = el.animate(
      [
        { transform: "translate(0, 0) scale(1) rotate(0deg)" },
        {
          transform: `translate(${dx * 0.5}px, ${dy * 0.5 + arcY}px) scale(${scale * 1.35}) rotate(${scrollDelta >= 0 ? -18 : 18}deg)`,
          offset: 0.5,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(0deg)` },
      ],
      { duration, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
    );

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

    const sec = sections[i];
    const icon = $(".menu-section__icon", sec);
    const menuEl = $("#menu");

    const startY = window.scrollY;
    const offset = bar.offsetHeight + 8;
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
    setTimeout(() => {
      menuEl.classList.remove("is-warping-down", "is-warping-up");
    }, duration * 0.72);

    const startTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        scrollAnimId = requestAnimationFrame(step);
      } else {
        scrollAnimId = null;
        locked = false;
        lastY = window.scrollY;
        revealVisible();
      }
    }

    scrollAnimId = requestAnimationFrame(step);
  }

  ["wheel", "touchmove"].forEach((evt) =>
    window.addEventListener(evt, () => { if (locked) cancelFlight(); }, { passive: true })
  );

  function buildNav(keepId) {
    inner.querySelectorAll(".cat").forEach((b) => b.remove());
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
    buttons = [...inner.querySelectorAll(".cat")];
    sections = buttons.map((b) => document.getElementById("cat-" + b.dataset.cat));
    buttons.forEach((btn, i) => btn.addEventListener("click", () => goTo(i)));
    active = -1;
    setActive(Math.max(0, cats.findIndex((c) => c.id === keepId)), { instant: true });
    bar.hidden = false;
  }

  /* ---- تتبع السكرول ---- */
  let ticking = false;
  let lastY = scrollY;

  function spy() {
    ticking = false;
    if (locked || !sections.length) return;
    const line = bar.offsetHeight + 24;
    let idx = 0;
    sections.forEach((s, i) => {
      if (!s.hidden && s.getBoundingClientRect().top <= line) idx = i;
    });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) idx = sections.length - 1;
    setActive(idx);
  }

  addEventListener(
    "scroll",
    () => {
      if (locked) return;
      const y = scrollY;
      if (Math.abs(y - lastY) > 1) {
        scrollDir = y > lastY ? "down" : "up";
        lastY = y;
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spy);
      }
    },
    { passive: true }
  );

  new IntersectionObserver(
    ([e]) => bar.classList.toggle("is-stuck", !e.isIntersecting && e.boundingClientRect.top < 0),
    { threshold: 0 }
  ).observe($("#catSentinel"));

  $("#catLogo").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  const replacePill = () => active >= 0 && movePill(buttons[active], false);
  new ResizeObserver(replacePill).observe(inner);
  new ResizeObserver(replacePill).observe(track);
  document.fonts && document.fonts.ready.then(replacePill);

  /* ======================================================
     اللغة
  ====================================================== */
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

  /* ======================================================
     الوضع الصباحي / الليلي
  ====================================================== */
  function updateThemeBtn() {
    const dark = html.dataset.theme === "dark";
    $("#themeBtn").setAttribute("aria-label", dark ? T().toLight : T().toDark);
  }

  function setTheme(next, cx, cy) {
    const apply = () => {
      html.dataset.theme = next;
      store.set("taza-theme", next);
      updateThemeBtn();
    };
    if (!document.startViewTransition) return apply();

    html.classList.add("vt-theme");
    const vt = document.startViewTransition(apply);
    vt.ready
      .then(() => {
        const r = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
        html.animate(
          { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${r}px at ${cx}px ${cy}px)`] },
          { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      })
      .catch(() => {});
    vt.finished.finally(() => html.classList.remove("vt-theme"));
  }

  $("#themeBtn").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTheme(html.dataset.theme === "dark" ? "light" : "dark", r.left + r.width / 2, r.top + r.height / 2);
  });
  $("#langBtn").addEventListener("click", switchLang);

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!store.get("taza-theme")) {
      html.dataset.theme = e.matches ? "dark" : "light";
      updateThemeBtn();
    }
  });

  /* ======================================================
     تشغيل
  ====================================================== */
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
