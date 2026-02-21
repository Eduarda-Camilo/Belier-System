/**
 * Rotas de autenticação: login (e opcionalmente "quem sou eu").
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// POST /api/auth/login — recebe { email, password }, devolve { token, user }
router.post('/login', authController.login);

// GET /api/auth/me — devolve o usuário atual (requer token no header)
// Útil para o frontend saber quem está logado ao recarregar a página
router.get('/me', auth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profile: req.user.profile,
    },
  });
});

module.exports = router;
