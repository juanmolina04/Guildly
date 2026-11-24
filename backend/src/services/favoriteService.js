const { db } = require('../config/firebase');

// favorites/{uid}_{gameId}: juegos que un usuario sigue (el corazón de la app).
const favorites = () => db.collection('favorites');
const docId = (uid, gameId) => `${uid}_${gameId}`;

async function listFavoriteGameIds(uid) {
  const snap = await favorites().where('userId', '==', uid).get();
  return snap.docs.map((doc) => doc.data().gameId).sort((a, b) => a - b);
}

async function addFavorite(uid, gameId) {
  await favorites().doc(docId(uid, gameId)).set({ userId: uid, gameId, createdAt: new Date().toISOString() });
}

async function removeFavorite(uid, gameId) {
  await favorites().doc(docId(uid, gameId)).delete();
}

module.exports = { listFavoriteGameIds, addFavorite, removeFavorite };