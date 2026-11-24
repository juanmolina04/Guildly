const games = require('../data/games');

const listGames = () => games;
const getGame = (id) => games.find((game) => game.id === Number(id)) || null;

module.exports = { listGames, getGame };
