// ════════════════════════════════════════
//  MATHX QUIZ — Firebase Realtime Database
// ════════════════════════════════════════

import { initializeApp }        from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, orderByChild, query, limitToFirst }
  from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDjbvZokPidO9VZapHPiN0qyorBpmRI_ys",
  authDomain:        "mathxquiz.firebaseapp.com",
  projectId:         "mathxquiz",
  storageBucket:     "mathxquiz.firebasestorage.app",
  messagingSenderId: "101799678128",
  appId:             "1:101799678128:web:1caeb80a9ce52a08552b75",
  databaseURL:       "https://mathxquiz-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── Guardar pontuação ────────────────────
window.fbSaveScore = async function(nome, pontos) {
  if (!nome || pontos === undefined) return;
  const rank     = window.calcularRank ? window.calcularRank(pontos) : 'Novato';
  const nomeKey  = nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const userRef  = ref(db, `ranking/${nomeKey}`);

  try {
    const snap = await get(userRef);
    const atual = snap.exists() ? snap.val().pontos : 0;
    if (pontos > atual) {
      await set(userRef, {
        nome,
        pontos,
        rank,
        data: new Date().toLocaleDateString('pt')
      });
    }
  } catch(e) {
    // fallback silencioso — localStorage continua a funcionar
    console.warn('Firebase offline, usando localStorage', e);
  }
};

// ── Carregar ranking em tempo real ───────
window.fbCarregarRanking = function(callback) {
  const rankingRef = query(
    ref(db, 'ranking'),
    orderByChild('pontos')
  );
  onValue(rankingRef, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const lista = [];
    snap.forEach(child => lista.push(child.val()));
    lista.sort((a, b) => b.pontos - a.pontos);
    callback(lista.slice(0, 20));
  });
};

// ── Carregar record do utilizador ────────
window.fbGetRecord = async function(nome) {
  const nomeKey = nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    const snap = await get(ref(db, `ranking/${nomeKey}`));
    return snap.exists() ? snap.val() : null;
  } catch(e) {
    return null;
  }
};

console.log('✅ Firebase Realtime Database ligado — MATHX Quiz');