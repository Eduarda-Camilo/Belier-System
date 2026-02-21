const express = require('express');
const router = express.Router();
const componentsController = require('../controllers/componentsController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/', auth, componentsController.list);
router.get('/:id', auth, componentsController.getOne);
router.post('/', auth, authorize('admin', 'designer'), componentsController.create);
router.put('/:id', auth, authorize('admin', 'designer'), componentsController.update);
router.delete('/:id', auth, authorize('admin'), componentsController.remove);

module.exports = router;
