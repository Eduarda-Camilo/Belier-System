const express = require('express');
const router = express.Router({ mergeParams: true });
const examplesController = require('../controllers/examplesController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/', examplesController.listByComponent);
router.post('/', auth, authorize('admin', 'designer'), examplesController.create);
router.put('/reorder', auth, authorize('admin', 'designer'), examplesController.reorder);
router.put('/:id', auth, authorize('admin', 'designer'), examplesController.update);
router.delete('/:id', auth, authorize('admin', 'designer'), examplesController.remove);

module.exports = router;
