const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const auth = require('../middlewares/auth');

router.get('/', auth, notificationsController.list);
router.put('/:id/read', auth, notificationsController.markAsRead);
router.post('/read-all', auth, notificationsController.markAllAsRead);

module.exports = router;
