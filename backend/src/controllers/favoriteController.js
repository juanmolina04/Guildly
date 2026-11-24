const favoriteService = require('../services/favoriteService');
const gameService = require('../services/gameService');
const HttpError = require('../utils/httpError');

function findGame(id) {
  const game = gameService.getGame(id);
  if (!game) throw new HttpError(404, 'Juego no encontrado.');
  return game;
}

async function listFavorites(req, res) {
  res.json(await favoriteService.listFavoriteGameIds(req.user.uid));
}

async function addFavorite(req, res) {
  const game = findGame(req.params.gameId);
  await favoriteService.addFavorite(req.user.uid, game.id);
  res.json({ gameId: game.id, favorite: true });
}

async function removeFavorite(req, res) {
  const game = findGame(req.params.gameId);
  await favoriteService.removeFavorite(req.user.uid, game.id);
  res.json({ gameId: game.id, favorite: false });
}

module.exports = { listFavorites, addFavorite, removeFavorite };