const { db } = require('../config/firebase');
const HttpError = require('../utils/httpError');
const userService = require('./userService');
const scoreService = require('./scoreService');
const postService = require('./postService');
const notificationService = require('./notificationService');
const gameService = require('./gameService');

const comments = () => db.collection('comments');
const MAX_LENGTH = 500;

// Devuelve los comentarios de una publicación como árbol: comentario -> replies[].
async function listComments(post) {
  const snap = await comments().where('postId', '==', post.id).get();
  const all = snap.docs.map((doc) => doc.data());

  const levels = await scoreService.getLevels(post.gameId, all.map((comment) => comment.authorId));
  const withLevel = all.map((comment) => ({ ...comment, authorLevel: levels[comment.authorId] }));

  const replies = withLevel
    .filter((c) => c.parentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return withLevel
    .filter((c) => !c.parentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((root) => ({ ...root, replies: replies.filter((r) => r.parentId === root.id) }));
}

async function createComment({ post, text, parentId, user }) {
  const cleanText = typeof text === 'string' ? text.trim() : '';
  if (!cleanText) throw new HttpError(400, 'El comentario no puede estar vacío.');
  if (cleanText.length > MAX_LENGTH) {
    throw new HttpError(400, `El comentario no puede superar ${MAX_LENGTH} caracteres.`);
  }

  let parent = null;
  if (parentId) {
    const parentSnap = await comments().doc(String(parentId)).get();
    parent = parentSnap.exists ? parentSnap.data() : null;
    if (!parent || parent.postId !== post.id) {
      throw new HttpError(404, 'El comentario que intentas responder no existe.');
    }
  }

  const profile = await userService.getOrCreateProfile(user);

  const ref = comments().doc();
  const comment = {
    id: ref.id,
    postId: post.id,
    gameId: post.gameId,
    text: cleanText,
    authorId: user.uid,
    authorName: profile.displayName,
    // Las respuestas son de un solo nivel: responder a una respuesta cuelga del comentario raíz.
    parentId: parent ? parent.parentId || parent.id : null,
    createdAt: new Date().toISOString(),
  };
  await ref.set(comment);
  await postService.incrementCommentCount(post.id);
  await scoreService.addPoints({
    gameId: post.gameId,
    userId: user.uid,
    userName: profile.displayName,
    action: 'comment',
  });

  const targetId = parent ? parent.authorId : post.authorId;
  if (targetId !== user.uid) {
    await notificationService.createNotification({
      userId: targetId,
      type: parent ? 'reply' : 'comment',
      gameId: post.gameId,
      gameName: gameService.getGame(post.gameId).name,
      postId: post.id,
      postTitle: post.title.slice(0, 60),
      commentId: comment.id,
      fromName: profile.displayName,
      text: cleanText.slice(0, 100),
    });
  }

  const levels = await scoreService.getLevels(post.gameId, [user.uid]);
  return { ...comment, authorLevel: levels[user.uid] };
}

module.exports = { listComments, createComment };
