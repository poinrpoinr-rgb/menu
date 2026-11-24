/* ========== لوحة إدارة TAZA 041 (Firebase Auth + Firestore مقسّم) ========== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const STORAGE_KEY = "taza-menu-live";
  const FEEDBACK_KEY = "taza-feedbacks";
  const CYCLE_KEY = "taza-rev-cycle";

  const bc = "BroadcastChannel" in window ? new BroadcastChannel("taza-sync") : null;
  let menuData = null;

  function toast(msg) {
    const t = $("#adminToast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  /* ---------- تسجيل الدخول بحساب Google (مغلق افتراضياً) ---------- */
  const ALLOWED_ADMINS = [
    "mpoinr12@gmail.com",
    // "owner@gmail.com",
  ];

  const lockScreen = $("#lockScreen");
  const pinErr = $("#pinErr");

  function handleAuthUser(user) {
    if (!user) {
      lockScreen.hidden = false;
      return;
    }
    const email = (user.email || "").trim().toLowerCase();
    const allowedSet = new Set(ALLOWED_ADMINS.map((e) => e.trim().toLowerCase()).filter(Boolean));
    if (allowedSet.size === 0 || !allowedSet.has(email)) {
      pinErr.textContent = `الحساب (${email}) غير مصرح له بالدخول!`;
      window.TazaCloud?.logout();
      lockScreen.hidden = false;
      return;
    }
    pinErr.textContent = "";
    lockScreen.hidden = true;
    toast(`أهلاً بك يا ${user.displayName || email} 👋`);
  }

  window.addEventListener("taza-auth-change", (e) => handleAuthUser(e.detail));
  if (window.TazaCloud?.currentUser) handleAuthUser(window.TazaCloud.currentUser);

  $("#googleLoginBtn")?.addEventListener("click", async () => {
    pinErr.textContent = "";
    try {
      if (!window.TazaCloud?.loginWithGoogle) {
        pinErr.textContent = "جاري تحميل Firebase... حاول بعد ثانية";
        return;
      }
      await window.TazaCloud.loginWithGoogle();
    } catch (err) {
      pinErr.textContent = "تعذّر تسجيل الدخول: " + (err.code || err.message);
    }
  });

  $("#logoutBtn")?.addEventListener("click", async () => {
    await window.TazaCloud?.logout();
    lockScreen.hidden = false;
    toast("تم تسجيل الخروج 👋");
  });
  $("#themeBtn")?.addEventListener("click", () => {
    const html = document.documentElement;
    const next = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = next;
    try { localStorage.setItem("taza-theme", next); } catch (_) {}
  });

  function syncLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData));
      localStorage.setItem("taza-sync-ping", String(Date.now()));
    } catch (_) {}
    if (bc) bc.postMessage({ type: "menu-updated" });
  }

  /* ---------- زر سحب الأقسام والأطباق من data/menu.json ورفعها للـ Firebase ---------- */
  $("#syncFromFileBtn")?.addEventListener("click", async () => {
    if (!confirm("هل تريد تحميل جميع الأقسام والأطباق من ملف data/menu.json ورفعها للـ Firebase؟")) return;
    try {
      const res = await fetch("data/menu.json?v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      menuData = await res.json();
      fillCatSelects(); renderItems(); renderCats();
      syncLocal();
      const ok = await window.TazaCloud?.syncAllMenu(menuData);
      toast(ok
        ? `تم رفع ${menuData.categories.length} قسم و ${menuData.items.length} طبق بنجاح 🔥`
        : "فشل الرفع السحابي! تحقق من قواعد Firestore");
    } catch (err) {
      toast("تعذّر قراءة data/menu.json! تأكد من تنسيق الملف");
    }
  });

  /* ---------- التبويبات ---------- */
  $("#adminTabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab[data-tab]");
    if (!btn) return;
    const name = btn.dataset.tab;
    $("#adminTabs").querySelectorAll(".tab").forEach((b) => b.classList.toggle("is-active", b === btn));
    document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.id !== `panel-${name}`));
  });

  /* ---------- 1) عرض وإدارة الأطباق ---------- */
  function fillCatSelects() {
    const curFilter = $("#filterCat").value || "all";
    $("#filterCat").innerHTML = `<option value="all">كل الأطباق (${menuData.items.length})</option>` +
      menuData.categories.map((c) => `<option value="${esc(c.id)}">${esc(c.icon)} ${esc(c.name)}</option>`).join("");
    $("#filterCat").value = menuData.categories.some((c) => c.id === curFilter) ? curFilter : "all";

    $("#itCat").innerHTML = menuData.categories
      .map((c) => `<option value="${esc(c.id)}">${esc(c.icon)} ${esc(c.name)}</option>`).join("");
  }

  function renderItems() {
    $("#cntItems").textContent = menuData.items.length;
    const fCat = $("#filterCat").value || "all";
    const list = fCat === "all" ? menuData.items : menuData.items.filter((i) => i.category === fCat);

    $("#itemsGrid").innerHTML = list.map((it) => {
      const cat = menuData.categories.find((c) => c.id === it.category);
      const isAvail = it.available !== false;
      return `
        <article class="card${isAvail ? "" : " is-hidden"}">
          ${it.image ? `<img class="card-thumb" src="${esc(it.image)}" alt="">` : ""}
          <div class="card-top">
            <h3 class="card-title">${esc(cat?.icon || "🍽️")} ${esc(it.name)}</h3>
            <span class="pill">${Number(it.price).toLocaleString("en-US")} ل.س</span>
          </div>
          <p class="card-sub">${esc(it.description || "بدون وصف")}</p>
          <div class="card-meta">
            <span class="pill">⚡ ${esc(it.calories ?? 350)} سعرة</span>
            ${it.featured ? `<span class="pill">🔥 الأكثر طلباً</span>` : ""}
            ${(it.tags || []).includes("spicy") ? `<span class="pill">🌶️ حار</span>` : ""}
            ${(it.tags || []).includes("vegetarian") ? `<span class="pill">🌱 نباتي</span>` : ""}
          </div>
          <div class="card-foot">
            <label class="switch">
              <input type="checkbox" data-toggle-item="${it.id}" ${isAvail ? "checked" : ""}>
              <span class="switch-track"></span>
              <span>${isAvail ? "ظاهر" : "مخفي"}</span>
            </label>
            <div style="display:flex;gap:0.35rem">
              <button class="btn btn--sm" type="button" data-edit-item="${it.id}">✏️ تعديل</button>
              <button class="btn btn--sm btn--danger" type="button" data-del-item="${it.id}">🗑️</button>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  $("#filterCat").addEventListener("change", renderItems);

  $("#itemsGrid").addEventListener("change", async (e) => {
    const inp = e.target.closest("input[data-toggle-item]");
    if (!inp) return;
    const item = menuData.items.find((x) => x.id === Number(inp.dataset.toggleItem));
    if (!item) return;
    item.available = inp.checked;
    renderItems();
    syncLocal();
    const ok = await window.TazaCloud?.saveItem(item);
    toast(ok
      ? (item.available ? `تم إظهار "${item.name}" ✅` : `تم إخفاء "${item.name}" 👁️‍🗨️`)
      : "فشل الحفظ السحابي!");
  });

  $("#itemsGrid").addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-item]");
    if (editBtn) {
      const item = menuData.items.find((x) => x.id === Number(editBtn.dataset.editItem));
      if (item) openItemDialog(item);
      return;
    }
    const delBtn = e.target.closest("[data-del-item]");
    if (delBtn) {
      const id = Number(delBtn.dataset.delItem);
      const item = menuData.items.find((x) => x.id === id);
      if (item && confirm(`هل تريد حذف "${item.name}" نهائياً؟`)) {
        menuData.items = menuData.items.filter((x) => x.id !== id);
        fillCatSelects(); renderItems();
        syncLocal();
        const ok = await window.TazaCloud?.deleteItem(id);
        toast(ok ? "تم حذف الطبق سحابياً 🗑️" : "فشل الحذف من السحابة!");
      }
    }
  });

  /* ---------- ضغط الصور الذكي (حجم خفيف جداً ~35KB لكل طبق) ---------- */
  const imgDropZone = $("#imgDropZone");
  const imgFileInp = $("#itImgFile");
  const imgPreview = $("#imgPreview");
  const imgDropHint = $("#imgDropHint");
  const imgRemoveBtn = $("#imgRemoveBtn");

  function setImgPreview(src) {
    $("#itImg").value = src || "";
    if (src) {
      imgPreview.src = src;
      imgPreview.hidden = false;
      imgDropHint.hidden = true;
      imgRemoveBtn.hidden = false;
    } else {
      imgPreview.removeAttribute("src");
      imgPreview.hidden = true;
      imgDropHint.hidden = false;
      imgRemoveBtn.hidden = true;
      if (imgFileInp) imgFileInp.value = "";
    }
  }

  function compressAndLoadImage(file) {
    if (!file || !file.type.startsWith("image/")) {
      toast("الرجاء اختيار ملف صورة صالح 📸");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 520;
        let w = img.width, h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w >= h) { h = Math.round((h * MAX_DIM) / w); w = MAX_DIM; }
          else { w = Math.round((w * MAX_DIM) / h); h = MAX_DIM; }
        }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const webpUrl = c.toDataURL("image/webp", 0.72);
        const finalUrl = webpUrl.startsWith("data:image/webp") ? webpUrl : c.toDataURL("image/jpeg", 0.72);
        setImgPreview(finalUrl);
        toast("تم ضغط وتجهيز الصورة بنجاح 📸✨");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  if (imgDropZone && imgFileInp) {
    imgDropZone.addEventListener("click", (e) => {
      if (e.target.closest("#imgRemoveBtn")) return;
      imgFileInp.click();
    });
    imgFileInp.addEventListener("change", () => {
      if (imgFileInp.files[0]) compressAndLoadImage(imgFileInp.files[0]);
    });
    imgRemoveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setImgPreview("");
    });
    ["dragenter", "dragover"].forEach((ev) =>
      imgDropZone.addEventListener(ev, (e) => { e.preventDefault(); imgDropZone.classList.add("is-drag"); })
    );
    ["dragleave", "drop"].forEach((ev) =>
      imgDropZone.addEventListener(ev, (e) => { e.preventDefault(); imgDropZone.classList.remove("is-drag"); })
    );
    imgDropZone.addEventListener("drop", (e) => {
      const f = e.dataTransfer?.files?.[0];
      if (f) compressAndLoadImage(f);
    });
  }

  /* ---------- نافذة إضافة / تعديل طبق ---------- */
  const itemDlg = $("#itemDlg");
  function openItemDialog(item = null) {
    $("#itemDlgTitle").textContent = item ? "تعديل الطبق" : "إضافة طبق جديد";
    $("#itId").value = item ? item.id : "";
    $("#itNameAr").value = item ? item.name : "";
    $("#itNameEn").value = item ? (item.name_en || "") : "";
    $("#itCat").value = item ? item.category : (menuData.categories[0]?.id || "");
    $("#itPrice").value = item ? item.price : "";
    $("#itCal").value = item ? (item.calories ?? 400) : 400;
    setImgPreview(item ? (item.image || "") : "");
    $("#itDescAr").value = item ? (item.description || "") : "";
    $("#itDescEn").value = item ? (item.description_en || "") : "";
    $("#itAvail").checked = item ? item.available !== false : true;
    $("#itFeat").checked = item ? !!item.featured : false;
    $("#itSpicy").checked = item ? (item.tags || []).includes("spicy") : false;
    $("#itVeg").checked = item ? (item.tags || []).includes("vegetarian") : false;

    const alSet = new Set(item ? (item.allergens || []) : []);
    $("#itAllergens").querySelectorAll("input").forEach((c) => (c.checked = alSet.has(c.value)));
    itemDlg.hidden = false;
  }

  $("#addItemBtn").addEventListener("click", () => openItemDialog(null));
  $("#closeItemDlg").addEventListener("click", () => (itemDlg.hidden = true));
  $("#cancelItemDlg").addEventListener("click", () => (itemDlg.hidden = true));

  $("#itemForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const idVal = $("#itId").value;
    const tags = [];
    if ($("#itSpicy").checked) tags.push("spicy");
    if ($("#itVeg").checked) tags.push("vegetarian");
    const allergens = [...$("#itAllergens").querySelectorAll("input:checked")].map((c) => c.value);

    const payload = {
      id: idVal ? Number(idVal) : (Math.max(0, ...menuData.items.map((x) => x.id)) + 1),
      category: $("#itCat").value,
      name: $("#itNameAr").value.trim(),
      name_en: $("#itNameEn").value.trim(),
      description: $("#itDescAr").value.trim(),
      description_en: $("#itDescEn").value.trim(),
      price: Number($("#itPrice").value) || 0,
      calories: Number($("#itCal").value) || 0,
      image: $("#itImg").value.trim(),
      available: $("#itAvail").checked,
      featured: $("#itFeat").checked,
      tags,
      allergens,
    };

    if (idVal) {
      const idx = menuData.items.findIndex((x) => x.id === payload.id);
      if (idx >= 0) menuData.items[idx] = payload;
    } else {
      menuData.items.push(payload);
    }

    itemDlg.hidden = true;
    fillCatSelects(); renderItems();
    syncLocal();
    const ok = await window.TazaCloud?.saveItem(payload);
    toast(ok
      ? (idVal ? "تم تعديل الطبق ومزامنته ⚡" : "تمت إضافة الطبق الجديد ⚡")
      : "فشل الحفظ السحابي! تحقق من قواعد Firestore");
  });

  /* ---------- 2) الأقسام (إظهار وإخفاء فقط) ---------- */
  function renderCats() {
    $("#cntCats").textContent = menuData.categories.length;
    $("#catsGrid").innerHTML = menuData.categories.map((c) => {
      const isVis = c.visible !== false;
      const count = menuData.items.filter((i) => i.category === c.id).length;
      return `
        <article class="card${isVis ? "" : " is-hidden"}">
          <div class="card-top">
            <h3 class="card-title">${esc(c.icon)} ${esc(c.name)}</h3>
            <span class="pill">${count} أطباق</span>
          </div>
          <p class="card-sub" dir="ltr">${esc(c.name_en)}</p>
          <div class="card-foot">
            <label class="switch">
              <input type="checkbox" data-toggle-cat="${esc(c.id)}" ${isVis ? "checked" : ""}>
              <span class="switch-track"></span>
              <span>${isVis ? "القسم ظاهر بالمنيو" : "القسم مخفي"}</span>
            </label>
          </div>
        </article>`;
    }).join("");
  }

  $("#catsGrid").addEventListener("change", async (e) => {
    const inp = e.target.closest("input[data-toggle-cat]");
    if (!inp) return;
    const cat = menuData.categories.find((c) => c.id === inp.dataset.toggleCat);
    if (!cat) return;
    cat.visible = inp.checked;
    renderCats();
    syncLocal();
    const ok = await window.TazaCloud?.saveCategory(cat);
    toast(ok
      ? (cat.visible ? `تم إظهار قسم "${cat.name}" ✅` : `تم إخفاء قسم "${cat.name}" 👁️‍🗨️`)
      : "فشل الحفظ السحابي!");
  });

  /* ---------- 3) تقييمات الزبائن ---------- */
  const revCycleSel = $("#revCycle");
  revCycleSel.value = localStorage.getItem(CYCLE_KEY) || "forever";
  revCycleSel.addEventListener("change", () => {
    localStorage.setItem(CYCLE_KEY, revCycleSel.value);
    window.TazaCloud?.saveRevCycle(revCycleSel.value);
    syncReviews("تم تحديث مدة التجديد التلقائي للتعليقات ⚡");
  });

  function getReviews() {
    try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]"); }
    catch (_) { return []; }
  }

  function renderReviews() {
    const list = getReviews();
    $("#cntRevs").textContent = list.length;
    if (!list.length) {
      $("#revsGrid").innerHTML = `<p class="card-sub">لا توجد تقييمات مرسلة من الزبائن بعد.</p>`;
      return;
    }
    $("#revsGrid").innerHTML = list.map((r) => {
      const approved = r.status === "approved";
      const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
      const dt = new Date(r.createdAt || r.createdAtMs || Date.now()).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });
      return `
        <article class="card${approved ? "" : " is-hidden"}">
          <div class="card-top">
            <h3 class="card-title">👤 ${esc(r.name || "ضيف")}</h3>
            <span class="pill" style="color:var(--cheddar)">${stars}</span>
          </div>
          <p class="card-sub">"${esc(r.note || "بدون تعليق نصي")}"</p>
          <div class="card-meta">
            <span class="pill">${approved ? "✅ منشور بالمنيو" : "⏳ بانتظار الموافقة"}</span>
            <span class="pill">🕒 ${esc(dt)}</span>
            ${(r.tags || []).map((tg) => `<span class="pill">${esc(tg)}</span>`).join("")}
          </div>
          <div class="card-foot">
            <button class="btn btn--sm ${approved ? "" : "btn--ok"}" type="button" data-approve-rev="${esc(r.id)}">
              ${approved ? "إخفاء من المنيو" : "✅ إظهار بالمنيو"}
            </button>
            <button class="btn btn--sm btn--danger" type="button" data-del-rev="${esc(r.id)}">🗑️ حذف</button>
          </div>
        </article>`;
    }).join("");
  }

  $("#revsGrid").addEventListener("click", (e) => {
    const appBtn = e.target.closest("[data-approve-rev]");
    if (appBtn) {
      const id = String(appBtn.dataset.approveRev);
      const list = getReviews();
      const rev = list.find((x) => String(x.id) === id);
      if (rev) {
        rev.status = rev.status === "approved" ? "pending" : "approved";
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
        if (rev.docId) window.TazaCloud?.setReviewStatus(rev.docId, rev.status);
        renderReviews();
        syncReviews(rev.status === "approved" ? "تم نشر التقييم في المنيو ✅" : "تم إخفاء التقييم");
      }
      return;
    }
    const delBtn = e.target.closest("[data-del-rev]");
    if (delBtn) {
      const id = String(delBtn.dataset.delRev);
      const list = getReviews();
      const target = list.find((x) => String(x.id) === id);
      if (target?.docId) window.TazaCloud?.deleteReview(target.docId);
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list.filter((x) => String(x.id) !== id)));
      renderReviews();
      syncReviews("تم حذف التقييم 🗑️");
    }
  });

  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(menuData, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "menu.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("تم تنزيل menu.json المحدّث 💾");
  });

  window.addEventListener("taza-cloud-menu", (e) => {
    if (!e.detail) return;
    menuData = e.detail;
    fillCatSelects(); renderItems(); renderCats();
  });
  window.addEventListener("taza-cloud-reviews", () => {
    revCycleSel.value = localStorage.getItem(CYCLE_KEY) || "forever";
    renderReviews();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === FEEDBACK_KEY) renderReviews();
  });

  async function boot() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { menuData = JSON.parse(saved); } catch (_) {}
    }
    if (!menuData) {
      try {
        const res = await fetch("data/menu.json?v=" + Date.now(), { cache: "no-store" });
        menuData = await res.json();
      } catch (_) {
        toast("تعذّر تحميل data/menu.json");
        return;
      }
    }
    fillCatSelects();
    renderItems();
    renderCats();
    renderReviews();
  }

  boot();
})();
