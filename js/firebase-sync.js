/* ========== الربط السحابي الفوري مع Firebase Firestore + Auth (TAZA 041) ========== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
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
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const metaDocRef = doc(db, "taza", "meta");
const settingsDocRef = doc(db, "taza", "settings");
const catsColRef = collection(db, "categories");
const itemsColRef = collection(db, "items");
const reviewsColRef = collection(db, "reviews");
const bc = "BroadcastChannel" in window ? new BroadcastChannel("taza-sync") : null;

let cloudState = {
  restaurant: null,
  categories: [],
  items: [],
  hasMeta: false,
  hasCats: false,
  hasItems: false,
};

function emitMenuIfReady() {
  if (!cloudState.hasCats && !cloudState.hasItems && !cloudState.hasMeta) return;
  clearTimeout(emitTimer);
  emitTimer = setTimeout(() => {
    const cached = (() => {
      try { return JSON.parse(localStorage.getItem("taza-menu-live") || "null"); }
      catch (_) { return null; }
    })();

    const payload = {
      restaurant: cloudState.restaurant || cached?.restaurant || {},
      categories: cloudState.categories.length ? cloudState.categories : (cached?.categories || []),
      items: cloudState.items.length ? cloudState.items : (cached?.items || []),
    };

    try {
      localStorage.setItem("taza-menu-live", JSON.stringify(payload));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("taza-cloud-menu", { detail: payload }));
    if (bc) bc.postMessage({ type: "menu-updated" });
  }, 250);
}

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

  // جلب أحدث نسخة من المنيو مباشرة من السحابة عند السحب للتحديث
  async fetchMenu() {
    try {
      const [metaSnap, catsSnap, itemsSnap] = await Promise.all([
        getDoc(metaDocRef),
        getDocs(catsColRef),
        getDocs(itemsColRef),
      ]);
      if (catsSnap.empty && itemsSnap.empty) return { exists: false, data: null };

      const categories = catsSnap.docs
        .map((d) => d.data())
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      const items = itemsSnap.docs
        .map((d) => d.data())
        .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

      const cached = JSON.parse(localStorage.getItem("taza-menu-live") || "null");
      const payload = {
        restaurant: metaSnap.exists() ? metaSnap.data().restaurant : (cached?.restaurant || {}),
        categories,
        items,
      };
      localStorage.setItem("taza-menu-live", JSON.stringify(payload));
      return { exists: true, data: payload };
    } catch (err) {
      console.error("fetchMenu error:", err);
      return { exists: false, data: null };
    }
  },

  // حفظ أو تعديل طبق واحد في مستنده الخاص (يدعم الصور المضغوطة بحرية)
  async saveItem(item) {
    try {
      await setDoc(doc(db, "items", String(item.id)), item);
      return true;
    } catch (err) {
      console.error("saveItem error:", err);
      return false;
    }
  },

  // حذف طبق واحد
  async deleteItem(id) {
    try {
      await deleteDoc(doc(db, "items", String(id)));
      return true;
    } catch (err) {
      console.error("deleteItem error:", err);
      return false;
    }
  },

  // حفظ أو تعديل قسم واحد
  async saveCategory(cat) {
    try {
      await setDoc(doc(db, "categories", String(cat.id)), cat);
      return true;
    } catch (err) {
      console.error("saveCategory error:", err);
      return false;
    }
  },

  // رفع كامل المنيو دفعة واحدة (عند السحب من menu.json أول مرة)
  async syncAllMenu(menuData) {
    try {
      const batch = writeBatch(db);
      if (menuData.restaurant) {
        batch.set(metaDocRef, { restaurant: menuData.restaurant, updatedAt: Date.now() });
      }
      (menuData.categories || []).forEach((c, idx) => {
        batch.set(doc(db, "categories", String(c.id)), { ...c, order: idx });
      });
      (menuData.items || []).forEach((it) => {
        batch.set(doc(db, "items", String(it.id)), it);
      });
      await batch.commit();
      return true;
    } catch (err) {
      console.error("syncAllMenu error:", err);
      return false;
    }
  },

  async saveRevCycle(cycle) {
    try {
      await setDoc(settingsDocRef, { revCycle: cycle }, { merge: true });
      return true;
    } catch (err) {
      console.error("Firestore saveRevCycle error:", err);
      return false;
    }
  },

  async addReview(entry) {
    try {
      await addDoc(reviewsColRef, { ...entry, createdAtMs: Date.now() });
      return true;
    } catch (err) {
      console.error("Firestore addReview error:", err);
      return false;
    }
  },

  async setReviewStatus(docId, status) {
    try {
      await updateDoc(doc(db, "reviews", docId), { status });
      return true;
    } catch (err) {
      console.error("Firestore setReviewStatus error:", err);
      return false;
    }
  },

  async deleteReview(docId) {
    try {
      await deleteDoc(doc(db, "reviews", docId));
      return true;
    } catch (err) {
      console.error("Firestore deleteReview error:", err);
      return false;
    }
  },
};

/* ---------- متابعة حالة تسجيل دخول الأدمن ---------- */
onAuthStateChanged(auth, (user) => {
  window.TazaCloud.currentUser = user || null;
  window.dispatchEvent(new CustomEvent("taza-auth-change", { detail: user || null }));
});

/* ---------- الاستماع اللحظي للمنيو من المجموعات المقسمة ---------- */
onSnapshot(metaDocRef, (snap) => {
  if (!snap.exists()) return;
  cloudState.restaurant = snap.data().restaurant || null;
  cloudState.hasMeta = true;
  emitMenuIfReady();
}, () => {});

onSnapshot(catsColRef, (snap) => {
  if (snap.empty) return;
  cloudState.categories = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  cloudState.hasCats = true;
  emitMenuIfReady();
}, (err) => console.warn("Firestore cats listener:", err.message));

onSnapshot(itemsColRef, (snap) => {
  if (snap.empty) return;
  cloudState.items = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  cloudState.hasItems = true;
  emitMenuIfReady();
}, (err) => console.warn("Firestore items listener:", err.message));

/* ---------- الاستماع اللحظي لإعداد التجديد التلقائي والتقييمات ---------- */
onSnapshot(settingsDocRef, (snap) => {
  if (!snap.exists()) return;
  const cycle = snap.data()?.revCycle || "forever";
  try { localStorage.setItem("taza-rev-cycle", cycle); } catch (_) {}
  window.dispatchEvent(new CustomEvent("taza-cloud-reviews"));
}, () => {});

const revQ = query(reviewsColRef, orderBy("createdAtMs", "desc"));
onSnapshot(revQ, (snap) => {
  const list = snap.docs.map((d) => ({ ...d.data(), docId: d.id, id: d.data().id || d.id }));
  try { localStorage.setItem("taza-feedbacks", JSON.stringify(list)); } catch (_) {}
  window.dispatchEvent(new CustomEvent("taza-cloud-reviews", { detail: list }));
}, (err) => console.warn("Firestore reviews listener:", err.message));
