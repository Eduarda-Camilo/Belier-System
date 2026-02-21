const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const auth = require('../middlewares/auth');

router.get('/component/:componentId', commentsController.listByComponent);
router.post('/component/:componentId', auth, commentsController.create);
router.put('/:id', auth, commentsController.update);
module.exports = router;
