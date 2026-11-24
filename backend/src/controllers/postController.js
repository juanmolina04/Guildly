const postService = require('../services/postService');
const gameService = require('../services/gameService');
const HttpError = require('../utils/httpError');

function findGame(id) {
  const game = gameService.getGame(id);
  if (!game) throw new HttpError(404, 'Juego no encontrado.');
  return game;
}

async function listPosts(req, res) {
  const game = findGame(req.params.gameId);
  res.json(await postService.listPosts(game.id, req.query.tag));
}

async function createPost(req, res) {
  const game = findGame(req.params.gameId);
  const { title, body, tag, image } = req.body || {};
  res.status(201).json(await postService.createPost({ game, title, body, tag, image, user: req.user }));
}

async function getPost(req, res) {
  res.json(await postService.getPost(req.params.postId));
}

async function getImage(req, res) {
  const buffer = await postService.getImage(req.params.postId);
  res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }).send(buffer);
}

module.exports = { listPosts, createPost, getPost, getImage };