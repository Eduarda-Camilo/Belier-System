const express = require('express');
const router = express.Router();
const componentsController = require('../controllers/componentsController');
const examplesRoutes = require('./examples');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/', componentsController.list);
router.get('/check-slug', componentsController.checkSlug);
router.get('/:id/changelog', componentsController.listComponentChangelog);
router.get('/:id', componentsController.getOne);
router.post('/', auth, authorize('admin', 'designer'), componentsController.create);
router.put('/:id', auth, authorize('admin', 'designer'), componentsController.update);
router.post('/:id/publish', auth, authorize('admin', 'designer'), componentsController.publish);
router.post('/:id/record-changelog', auth, authorize('admin', 'designer'), componentsController.recordChangelog);
router.post('/:id/archive', auth, authorize('admin', 'designer'), componentsController.archive);
router.delete('/:id', auth, authorize('admin'), componentsController.remove);

router.use('/:componentId/examples', examplesRoutes);

module.exports = router;
