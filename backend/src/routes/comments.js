const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const auth = require('../middlewares/auth');

router.get('/component/:componentId', auth, commentsController.listByComponent);
router.post('/component/:componentId', auth, commentsController.create);

module.exports = router;
