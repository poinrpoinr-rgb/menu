
/* ========== الربط السحابي الفوري مع Firebase Firestore (TAZA 041 Real-time Sync) ========== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

const menuDocRef = doc(db, "taza", "menu");
const settingsDocRef = doc(db, "taza", "settings");
const reviewsColRef = collection(db, "reviews");
const bc = "BroadcastChannel" in window ? new BroadcastChannel("taza-sync") : null;

/* ---------- واجهة موحدة يستخدمها admin.js و menu.js و extras.js ---------- */
window.TazaCloud = {
  ready: true,

  // حفظ المنيو الكامل (أقسام + أطباق) على السحابة
  async saveMenu(menuData) {
    try {
      await setDoc(menuDocRef, { data: menuData, updatedAt: Date.now() });
      return true;
    } catch (err) {
      console.error("Firestore saveMenu error:", err);
      return false;
    }
  },

  // حفظ مدة تجديد التعليقات (يومي / أسبوعي / دائم)
  async saveRevCycle(cycle) {
    try {
      await setDoc(settingsDocRef, { revCycle: cycle }, { merge: true });
      return true;
    } catch (err) {
      console.error("Firestore saveRevCycle error:", err);
      return false;
    }
  },

  // إرسال تقييم جديد من الزبون إلى السحابة
  async addReview(entry) {
    try {
      await addDoc(reviewsColRef, { ...entry, createdAtMs: Date.now() });
      return true;
    } catch (err) {
      console.error("Firestore addReview error:", err);
      return false;
    }
  },

  // موافقة / إخفاء تقييم من الأدمن
  async setReviewStatus(docId, status) {
    try {
      await updateDoc(doc(db, "reviews", docId), { status });
      return true;
    } catch (err) {
      console.error("Firestore setReviewStatus error:", err);
      return false;
    }
  },

  // حذف تقييم من الأدمن
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

/* ---------- 1) الاستماع اللحظي للمنيو من Firestore (Real-time onSnapshot) ---------- */
onSnapshot(
  menuDocRef,
  (snap) => {
    if (!snap.exists()) return;
    const payload = snap.data()?.data;
    if (!payload) return;
    try {
      localStorage.setItem("taza-menu-live", JSON.stringify(payload));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("taza-cloud-menu", { detail: payload }));
    if (bc) bc.postMessage({ type: "menu-updated" });
  },
  (err) => console.warn("Firestore menu listener:", err.message)
);

/* ---------- 2) الاستماع اللحظي لإعداد التجديد التلقائي ---------- */
onSnapshot(
  settingsDocRef,
  (snap) => {
    if (!snap.exists()) return;
    const cycle = snap.data()?.revCycle || "forever";
    try {
      localStorage.setItem("taza-rev-cycle", cycle);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("taza-cloud-reviews"));
  },
  () => {}
);

/* ---------- 3) الاستماع اللحظي لتقييمات الزبائن من Firestore ---------- */
const revQ = query(reviewsColRef, orderBy("createdAtMs", "desc"));
onSnapshot(
  revQ,
  (snap) => {
    const list = snap.docs.map((d) => ({ ...d.data(), docId: d.id, id: d.data().id || d.id }));
    try {
      localStorage.setItem("taza-feedbacks", JSON.stringify(list));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("taza-cloud-reviews", { detail: list }));
  },
  (err) => console.warn("Firestore reviews listener:", err.message)
);
