/* ========== الربط السحابي الفوري مع Firebase Firestore + Auth + Storage (TAZA 041) ========== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBeMjFtzBn7bFQ3ht4Sk1RYJygs3H9bJg",
  authDomain: "taza041-2b01f.firebaseapp.com",
  projectId: "taza041-2b01f",
  storageBucket: "taza041-2b01f.firebasestorage.app",
  messagingSenderId: "436214370293",
  appId: "1:436214370293:web:d7d7ed89413e09caf6dabc",
  measurementId: "G-VGQLB32ZW8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const menuDocRef = doc(db, "taza", "menu");
const settingsDocRef = doc(db, "taza", "settings");
const reviewsColRef = collection(db, "reviews");
const bc = "BroadcastChannel" in window ? new BroadcastChannel("taza-sync") : null;

/* ---------- واجهة موحدة يستخدمها admin.js و menu.js و extras.js ---------- */
window.TazaCloud = {
  ready: true,
  currentUser: null,

  async loginWithGoogle() {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  },

  async logout() {
    await signOut(auth);
  },

  // جلب أحدث نسخة من المنيو مباشرة من السحابة (يستخدمها السحب للتحديث)
  async fetchMenu() {
    let snap;
    try {
      snap = await getDocFromServer(menuDocRef);
    } catch (_) {
      snap = await getDoc(menuDocRef);
    }
    if (!snap.exists()) return { exists: false, data: null };
    const payload = snap.data()?.data || null;
    if (payload) {
      try {
        localStorage.setItem("taza-menu-live", JSON.stringify(payload));
      } catch (_) {}
    }
    return { exists: true, data: payload };
  },

  // رفع صورة الطبق إلى Firebase Storage وإرجاع رابطها المباشر
  async uploadDishImage(blob, ext = "webp") {
    const fileName = `dishes/dish_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, blob, {
      contentType: blob.type || `image/${ext}`, cacheControl: "public, max-age=31536000", }); return await getDownloadURL(storageRef); },  // حفظ المنيو الكامل (أقسام + أطباق) على السحابة async saveMenu(menuData) { try { await setDoc(menuDocRef, { data: menuData, updatedAt: Date.now() }); return true; } catch (err) { console.error("Firestore saveMenu error:", err); return false; } },  // حفظ مدة تجديد التعليقات (يومي / أسبوعي / دائم) async saveRevCycle(cycle) { try { await setDoc(settingsDocRef, { revCycle: cycle }, { merge: true }); return true; } catch (err) { console.error("Firestore saveRevCycle error:", err); return false; } },  // إرسال تقييم جديد من الزبون إلى السحابة async addReview(entry) { try { await addDoc(reviewsColRef, { ...entry, createdAtMs: Date.now() }); return true; } catch (err) { console.error("Firestore addReview error:", err); return false; } },  // موافقة / إخفاء تقييم من الأدمن async setReviewStatus(docId, status) { try { await updateDoc(doc(db, "reviews", docId), { status }); return true; } catch (err) { console.error("Firestore setReviewStatus error:", err); return false; } },  // حذف تقييم من الأدمن async deleteReview(docId) { try { await deleteDoc(doc(db, "reviews", docId)); return true; } catch (err) { console.error("Firestore deleteReview error:", err); return false; } }, };  /* ---------- متابعة حالة تسجيل دخول الأدمن ---------- */ onAuthStateChanged(auth, (user) => { window.TazaCloud.currentUser = user \vert{}\vert{} null; window.dispatchEvent(new CustomEvent("taza-auth-change", { detail: user \vert{}\vert{} null })); });  /* ---------- 1) الاستماع اللحظي للمنيو من Firestore ---------- */ onSnapshot( menuDocRef, (snap) => { if (!snap.exists()) return; const payload = snap.data()?.data; if (!payload) return; try { localStorage.setItem("taza-menu-live", JSON.stringify(payload)); } catch (_) {} window.dispatchEvent(new CustomEvent("taza-cloud-menu", { detail: payload })); if (bc) bc.postMessage({ type: "menu-updated" }); }, (err) => console.warn("Firestore menu listener:", err.message) );  /* ---------- 2) الاستماع اللحظي لإعداد التجديد التلقائي ---------- */ onSnapshot( settingsDocRef, (snap) => { if (!snap.exists()) return; const cycle = snap.data()?.revCycle \vert{}\vert{} "forever"; try { localStorage.setItem("taza-rev-cycle", cycle); } catch (_) {} window.dispatchEvent(new CustomEvent("taza-cloud-reviews")); }, () => {} );  /* ---------- 3) الاستماع اللحظي لتقييمات الزبائن من Firestore ---------- */ const revQ = query(reviewsColRef, orderBy("createdAtMs", "desc")); onSnapshot( revQ, (snap) => { const list = snap.docs.map((d) => ({ ...d.data(), docId: d.id, id: d.data().id \vert{}\vert{} d.id })); try { localStorage.setItem("taza-feedbacks", JSON.stringify(list)); } catch (_) {} window.dispatchEvent(new CustomEvent("taza-cloud-reviews", { detail: list })); }, (err) => console.warn("Firestore reviews listener:", err.message) ); ```  ---  ## 2. ملف `js/admin.js` (محدّث بالكامل) > **مهم:** تأكد من تعديل الإيميلات داخل `ALLOWED_ADMINS` في السطر 22 بإيميلك وإيميل صاحب المطعم.  ```javascript /* ========== لوحة إدارة TAZA 041 (Firebase Auth + Firestore + Storage) ========== */ (() => { const $ = (s, r = document) => r.querySelector(s); const STORAGE_KEY = "taza-menu-live"; const FEEDBACK_KEY = "taza-feedbacks"; const CYCLE_KEY = "taza-rev-cycle";  const bc = "BroadcastChannel" in window ? new BroadcastChannel("taza-sync") : null; let menuData = null; let isUploadingImg = false; let tempPreviewUrl = "";  function toast(msg) { const t = $("#adminToast"); t.textContent = msg; t.classList.add("is-on"); clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove("is-on"), 2600); }  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])); }  /* ---------- تسجيل الدخول بحساب Google (مغلق افتراضياً) ---------- */ // ضع إيميلك وإيميل صاحب المطعم هنا فقط (يجب أن تطابق الإيميلات في قواعد Firebase) const ALLOWED_ADMINS = [ "mpoinr12@gmail.com", // "owner@gmail.com", ];  const lockScreen = $("#lockScreen"); const pinErr = $("#pinErr");  function handleAuthUser(user) { if (!user) { lockScreen.hidden = false; return; } const email = (user.email \vert{}\vert{} "").trim().toLowerCase(); const allowedSet = new Set(ALLOWED_ADMINS.map((e) => e.trim().toLowerCase()).filter(Boolean)); if (allowedSet.size === 0 \vert{}\vert{} !allowedSet.has(email)) { pinErr.textContent = `الحساب (${email}) غير مصرح له بالدخول!`;
      window.TazaCloud?.logout();
      lockScreen.hidden = false;
      return;
    }
    pinErr.textContent = "";
    lockScreen.hidden = true;
    toast(`أهلاً بك يا ${user.displayName \vert{}\vert{} email} 👋`); }  window.addEventListener("taza-auth-change", (e) => handleAuthUser(e.detail)); if (window.TazaCloud?.currentUser) handleAuthUser(window.TazaCloud.currentUser);  $("#googleLoginBtn")?.addEventListener("click", async () => { pinErr.textContent = ""; try { if (!window.TazaCloud?.loginWithGoogle) { pinErr.textContent = "جاري تحميل Firebase... حاول بعد ثانية"; return; } await window.TazaCloud.loginWithGoogle(); } catch (err) { pinErr.textContent = "تعذّر تسجيل الدخول: " + (err.code \vert{}\vert{} err.message); } });  $("#logoutBtn")?.addEventListener("click", async () => { await window.TazaCloud?.logout(); lockScreen.hidden = false; toast("تم تسجيل الخروج 👋"); });  /* ---------- حفظ وبث التعديلات فوراً (محلي + Firebase Firestore) ---------- */ async function saveAndSync(msg = "تم الحفظ والمزامنة سحابياً ⚡") { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData)); localStorage.setItem("taza-sync-ping", String(Date.now())); } catch (_) {} if (bc) bc.postMessage({ type: "menu-updated" }); if (window.TazaCloud?.saveMenu) { const ok = await window.TazaCloud.saveMenu(menuData); toast(ok ? msg : "فشل الحفظ السحابي! تحقق من صلاحيات الحساب وقواعد Firestore"); } else { toast(msg); } }  function syncReviews(msg = "تم تحديث التقييمات ⚡") { localStorage.setItem("taza-sync-ping", String(Date.now())); if (bc) bc.postMessage({ type: "reviews-updated" }); toast(msg); }  /* ---------- زر سحب الأقسام والأطباق من data/menu.json ورفعها للـ Firebase ---------- */ $("#syncFromFileBtn")?.addEventListener("click", async () => { if (!confirm("هل تريد تحميل جميع الأقسام والأطباق من ملف data/menu.json ورفعها للـ Firebase؟")) return; try { const res = await fetch("data/menu.json?v=" + Date.now(), { cache: "no-store" }); if (!res.ok) throw new Error(res.status); menuData = await res.json(); fillCatSelects(); renderItems(); renderCats(); await saveAndSync(`تم تحميل ${menuData.categories.length} قسم و ${menuData.items.length} طبق ومزامنتهم 🔥`); } catch (err) { toast("تعذّر قراءة data/menu.json! تأكد من تنسيق الملف"); } });  /* ---------- التبويبات ---------- */ $("#adminTabs").addEventListener("click", (e) => { const btn = e.target.closest(".tab[data-tab]"); if (!btn) return; const name = btn.dataset.tab; $("#adminTabs").querySelectorAll(".tab").forEach((b) => b.classList.toggle("is-active", b === btn)); document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.id !== `panel-${name}`));
  });

  /* ---------- 1) عرض وإدارة الأطباق ---------- */
  function fillCatSelects() {
    const curFilter = $("#filterCat").value || "all";
    $("#filterCat").innerHTML = `<option value="all">كل الأطباق (${menuData.items.length})</option>` +
      menuData.categories.map((c) => `<option value="${esc(c.id)}">${esc(c.icon)}${esc(c.name)}</option>`).join("");
    $("#filterCat").value = menuData.categories.some((c) => c.id === curFilter) ? curFilter : "all";

    $("#itCat").innerHTML = menuData.categories
      .map((c) => `<option value="${esc(c.id)}">${esc(c.icon)}${esc(c.name)}</option>`).join("");
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
            <h3 class="card-title">${esc(cat?.icon \vert{}\vert{} "🍽️")} ${esc(it.name)}</h3>
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
            <div style="
