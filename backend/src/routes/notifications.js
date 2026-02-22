const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const auth = require('../middlewares/auth');

router.get('/unread-count', auth, notificationsController.unreadCount);
router.get('/authors', auth, notificationsController.listAuthors);
router.patch('/read-bulk', auth, notificationsController.readBulk);
router.patch('/unread-bulk', auth, notificationsController.unreadBulk);
router.get('/', auth, notificationsController.list);
router.patch('/:id/read', auth, notificationsController.markAsRead);

module.exports = router;
