// Puntos que gana un usuario en la comunidad de un juego y su nivel en ella.
const POINTS = { post: 10, comment: 3 };
const POINTS_PER_LEVEL = 20;

const levelFor = (points = 0) => Math.floor(points / POINTS_PER_LEVEL) + 1;

module.exports = { POINTS, levelFor };
