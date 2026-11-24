const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const user = require('../controllers/userController');
const game = require('../controllers/gameController');
const post = require('../controllers/postController');
const comment = require('../controllers/commentController');
const notification = require('../controllers/notificationController');
const favorite = require('../controllers/favoriteController');

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Todo lo demás requiere sesión de Firebase.
router.get('/posts/:postId/image', post.getImage);
router.use(requireAuth);

router.post('/users', user.createUser);
router.get('/users/me', user.getMe);
router.get('/users/me/favorites', favorite.listFavorites);

router.get('/games', game.listGames);
router.get('/games/:gameId', game.getGame);
router.get('/games/:gameId/stats', game.getStats);
router.put('/games/:gameId/favorite', favorite.addFavorite);
router.delete('/games/:gameId/favorite', favorite.removeFavorite);
router.get('/games/:gameId/top', game.getTop);
router.get('/games/:gameId/posts', post.listPosts);
router.post('/games/:gameId/posts', post.createPost);

router.get('/posts/:postId', post.getPost);
router.get('/posts/:postId/comments', comment.listComments);
router.post('/posts/:postId/comments', comment.createComment);

router.get('/notifications', notification.listNotifications);
router.patch('/notifications/:id/read', notification.markAsRead);

module.exports = router;