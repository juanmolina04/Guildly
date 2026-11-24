const gameService = require('../services/gameService');
const scoreService = require('../services/scoreService');
const statsService = require('../services/statsService');
const HttpError = require('../utils/httpError');

function findGame(id) {
  const game = gameService.getGame(id);
  if (!game) throw new HttpError(404, 'Juego no encontrado.');
  return game;
}

function listGames(_req, res) {
  res.json(gameService.listGames());
}

function getGame(req, res) {
  res.json(findGame(req.params.gameId));
}

// Top del gremio: los 5 miembros con más puntos en la comunidad del juego.
async function getTop(req, res) {
  const game = findGame(req.params.gameId);
  res.json(await scoreService.getTop(game.id));
}

// Datos del panel de la comunidad: miembros, seguidores, actividad, fecha de creación...
async function getStats(req, res) {
  const game = findGame(req.params.gameId);
  res.json(await statsService.getGameStats(game));
}

module.exports = { listGames, getGame, getTop, getStats };