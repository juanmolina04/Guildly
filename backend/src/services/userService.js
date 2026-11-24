const { db } = require('../config/firebase');

const users = () => db.collection('users');

async function getUser(uid) {
  const snap = await users().doc(uid).get();
  return snap.exists ? snap.data() : null;
}

// Crea el perfil en users/{uid} si no existe (sirve para cuentas nuevas y antiguas).
async function upsertUser({ uid, email }) {
  const existing = await getUser(uid);
  if (existing) return { user: existing, created: false };

  const user = {
    uid,
    email,
    displayName: (email || 'usuario').split('@')[0],
    createdAt: new Date().toISOString(),
  };
  await users().doc(uid).set(user);
  return { user, created: true };
}

async function getOrCreateProfile(authUser) {
  return (await getUser(authUser.uid)) || (await upsertUser(authUser)).user;
}

module.exports = { getUser, upsertUser, getOrCreateProfile };
