const { db } = require('../config/firebase');

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 7; // ventana para medir la actividad reciente
const FULL_SCALE = 30; // puntos de actividad que llenan el velocímetro al 100 %

// Actividad reciente: publicación = 5, comentario o respuesta = 2.
function activityLevel(points) {
  const score = Math.min(100, Math.round((points / FULL_SCALE) * 100));
  let label = 'Tranquila';
  if (score >= 80) label = '¡En llamas!';
  else if (score >= 50) label = 'Muy activa';
  else if (score >= 25) label = 'Activa';
  return { score, label, windowDays: WINDOW_DAYS };
}

const byGame = (collection, gameId) => db.collection(collection).where('gameId', '==', gameId).get();

async function getGameStats(game) {
  const [scoresSnap, postsSnap, commentsSnap, favoritesSnap] = await Promise.all([
    byGame('scores', game.id),
    byGame('posts', game.id),
    byGame('comments', game.id),
    byGame('favorites', game.id),
  ]);

  const posts = postsSnap.docs.map((doc) => doc.data());
  const comments = commentsSnap.docs.map((doc) => doc.data());

  const since = new Date(Date.now() - WINDOW_DAYS * DAY_MS).toISOString();
  const recentPosts = posts.filter((p) => p.createdAt >= since);
  const recentComments = comments.filter((c) => c.createdAt >= since);
  const activeUsers = new Set([...recentPosts, ...recentComments].map((item) => item.authorId));

  return {
    createdAt: game.createdAt,
    members: scoresSnap.docs.length,
    followers: favoritesSnap.docs.length,
    activeUsers: activeUsers.size,
    posts: posts.length,
    comments: comments.length,
    activity: activityLevel(recentPosts.length * 5 + recentComments.length * 2),
  };
}

module.exports = { getGameStats };