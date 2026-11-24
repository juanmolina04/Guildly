const userService = require('../services/userService');
const HttpError = require('../utils/httpError');

async function createUser(req, res) {
  const { user, created } = await userService.upsertUser(req.user);
  res.status(created ? 201 : 200).json(user);
}

async function getMe(req, res) {
  const user = await userService.getUser(req.user.uid);
  if (!user) throw new HttpError(404, 'Perfil no encontrado. Usa POST /api/users primero.');
  res.json(user);
}

module.exports = { createUser, getMe };
