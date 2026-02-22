const express = require('express');
const router = express.Router();
const versionsController = require('../controllers/versionsController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/changelog', versionsController.listChangelog);
router.get('/component/:componentId', versionsController.listByComponent);
router.post('/component/:componentId', auth, authorize('admin', 'designer'), versionsController.create);

module.exports = router;
