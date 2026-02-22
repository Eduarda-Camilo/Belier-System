/**
 * Agrupa todas as rotas da API em um único router.
 *
 * Router: um "mini-app" Express que só cuida de um pedaço das rotas.
 * Rotas em /api/auth/* vêm de auth.js; em /api/components/* de components.js; etc.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const componentsRoutes = require('./components');
const versionsRoutes = require('./versions');
const commentsRoutes = require('./comments');
const notificationsRoutes = require('./notifications');
const usersRoutes = require('./users');

router.use('/auth', authRoutes);
router.use('/components', componentsRoutes);
router.use('/versions', versionsRoutes);
router.use('/comments', commentsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/users', usersRoutes);

router.get('/', (_, res) => {
  res.json({ message: 'Belier-System API — use /api/auth/login, /api/components, etc.' });
});

module.exports = router;
