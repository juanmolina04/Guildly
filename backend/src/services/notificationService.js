const { db } = require('../config/firebase');
const HttpError = require('../utils/httpError');

const notifications = () => db.collection('notifications');

async function createNotification(data) {
  const ref = notifications().doc();
  const notification = { id: ref.id, ...data, read: false, createdAt: new Date().toISOString() };
  await ref.set(notification);
  return notification;
}

async function listNotifications(userId, { unreadOnly = false } = {}) {
  let query = notifications().where('userId', '==', userId);
  if (unreadOnly) query = query.where('read', '==', false);
  const snap = await query.get();
  return snap.docs
    .map((doc) => doc.data())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function markAsRead(userId, id) {
  const ref = notifications().doc(id);
  const snap = await ref.get();
  if (!snap.exists || snap.data().userId !== userId) {
    throw new HttpError(404, 'Notificación no encontrada.');
  }
  await ref.update({ read: true });
  return { ...snap.data(), read: true };
}

module.exports = { createNotification, listNotifications, markAsRead };
