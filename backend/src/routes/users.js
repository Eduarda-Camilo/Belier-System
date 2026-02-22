const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/', auth, authorize('admin'), usersController.list);
router.post('/', auth, authorize('admin'), usersController.create);
router.put('/:id', auth, authorize('admin'), usersController.update);
router.delete('/:id', auth, authorize('admin'), usersController.destroy);

module.exports = router;
