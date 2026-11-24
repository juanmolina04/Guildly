const { db, increment } = require('../config/firebase');
const HttpError = require('../utils/httpError');
const userService = require('./userService');
const scoreService = require('./scoreService');

const posts = () => db.collection('posts');

const TAGS = ['guia', 'pregunta', 'discusion', 'noticia'];
const MAX_TITLE = 100;
const MAX_BODY = 2000;
const MAX_IMAGE_CHARS = 900000; // ~650 KB de imagen en base64 (el front la reduce antes de enviarla)

const postImages = () => db.collection('postImages');

async function withLevels(gameId, list) {
  const levels = await scoreService.getLevels(gameId, list.map((p) => p.authorId));
  return list.map((p) => ({ ...p, authorLevel: levels[p.authorId] }));
}

async function listPosts(gameId, tag) {
  if (tag && !TAGS.includes(tag)) throw new HttpError(400, 'Etiqueta no válida.');

  let query = posts().where('gameId', '==', gameId);
  if (tag) query = query.where('tag', '==', tag);
  const snap = await query.get();

  const list = snap.docs.map((doc) => doc.data()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return withLevels(gameId, list);
}

async function getPost(postId) {
  const snap = await posts().doc(String(postId)).get();
  if (!snap.exists) throw new HttpError(404, 'Publicación no encontrada.');
  const post = snap.data();
  return (await withLevels(post.gameId, [post]))[0];
}

async function createPost({ game, title, body, tag, image, user }) {
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanBody = typeof body === 'string' ? body.trim() : '';
  if (!TAGS.includes(tag)) throw new HttpError(400, 'Elige una etiqueta: guia, pregunta, discusion o noticia.');
  if (!cleanTitle) throw new HttpError(400, 'La publicación necesita un título.');
  if (cleanTitle.length > MAX_TITLE) throw new HttpError(400, `El título no puede superar ${MAX_TITLE} caracteres.`);
  if (!cleanBody) throw new HttpError(400, 'La publicación necesita contenido.');
  if (cleanBody.length > MAX_BODY) throw new HttpError(400, `El contenido no puede superar ${MAX_BODY} caracteres.`);

  let cleanImage = null;
  if (image !== undefined && image !== null && image !== '') {
    if (typeof image !== 'string' || image.length > MAX_IMAGE_CHARS) throw new HttpError(400, 'La imagen es demasiado grande.');
    cleanImage = image.replace(/^data:image\/jpeg;base64,/, '');
    // Todo JPEG en base64 empieza por "/9j/".
    if (!cleanImage.startsWith('/9j/')) throw new HttpError(400, 'La imagen debe ser JPEG.');
  }

  const profile = await userService.getOrCreateProfile(user);

  const ref = posts().doc();
  const post = {
    id: ref.id,
    gameId: game.id,
    title: cleanTitle,
    body: cleanBody,
    tag,
    authorId: user.uid,
    authorName: profile.displayName,
    commentCount: 0,
    hasImage: !!cleanImage,
    createdAt: new Date().toISOString(),
  };
  if (cleanImage) await postImages().doc(ref.id).set({ data: cleanImage });
  await ref.set(post);
  await scoreService.addPoints({ gameId: game.id, userId: user.uid, userName: profile.displayName, action: 'post' });

  return (await withLevels(game.id, [post]))[0];
}

async function getImage(postId) {
  const snap = await postImages().doc(String(postId)).get();
  if (!snap.exists) throw new HttpError(404, 'Imagen no encontrada.');
  return Buffer.from(snap.data().data, 'base64');
}

async function incrementCommentCount(postId) {
  await posts().doc(postId).update({ commentCount: increment(1) });
}

module.exports = { TAGS, listPosts, getPost, createPost, getImage, incrementCommentCount };