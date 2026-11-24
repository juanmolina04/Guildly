const { auth } = require('../config/firebase');
const HttpError = require('../utils/httpError');

// Valida el token de Firebase que manda la app en "Authorization: Bearer <token>".
async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Falta el token de autenticación.');

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email || '' };
  } catch {
    throw new HttpError(401, 'Token inválido o vencido.');
  }
  next();
}

module.exports = requireAuth;
