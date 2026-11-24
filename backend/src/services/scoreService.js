const { db, increment } = require('../config/firebase');
const { POINTS, levelFor } = require('../utils/levels');

// scores/{gameId}_{uid}: puntos de un usuario en la comunidad de un juego.
const scores = () => db.collection('scores');

// action: 'post' o 'comment' (las respuestas cuentan como comentario).
async function addPoints({ gameId, userId, userName, action }) {
  await scores()
    .doc(`${gameId}_${userId}`)
    .set(
      {
        gameId,
        userId,
        userName,
        points: increment(POINTS[action]),
        [action === 'post' ? 'posts' : 'comments']: increment(1),
      },
      { merge: true },
    );
}

// Devuelve { uid: nivel } para los usuarios dados en la comunidad de ese juego.
async function getLevels(gameId, userIds) {
  const unique = [...new Set(userIds)];
  const snaps = await Promise.all(unique.map((uid) => scores().doc(`${gameId}_${uid}`).get()));
  const levels = {};
  unique.forEach((uid, i) => {
    levels[uid] = levelFor(snaps[i].exists ? snaps[i].data().points : 0);
  });
  return levels;
}

async function getTop(gameId, limit = 5) {
  const snap = await scores().where('gameId', '==', gameId).get();
  return snap.docs
    .map((doc) => doc.data())
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((s, i) => ({
      position: i + 1,
      userId: s.userId,
      userName: s.userName,
      points: s.points,
      level: levelFor(s.points),
      posts: s.posts || 0,
      comments: s.comments || 0,
    }));
}

module.exports = { addPoints, getLevels, getTop };
