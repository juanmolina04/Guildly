const notificationService = require('../services/notificationService');

async function listNotifications(req, res) {
  const unreadOnly = req.query.unread === 'true';
  res.json(await notificationService.listNotifications(req.user.uid, { unreadOnly }));
}

async function markAsRead(req, res) {
  res.json(await notificationService.markAsRead(req.user.uid, req.params.id));
}

module.exports = { listNotifications, markAsRead };
