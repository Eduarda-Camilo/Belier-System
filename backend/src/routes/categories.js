const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/', auth, categoriesController.list);
router.post('/', auth, authorize('admin', 'designer'), categoriesController.create);
router.put('/:id', auth, authorize('admin', 'designer'), categoriesController.update);
router.delete('/:id', auth, authorize('admin', 'designer'), categoriesController.remove);

module.exports = router;
