/**
 * Middleware de autenticação: garante que a requisição veio de um usuário logado.
 *
 * Como funciona:
 * 1. O cliente envia o JWT no header: Authorization: Bearer <token>
 * 2. Extraímos o token e verificamos com jwt.verify (usando JWT_SECRET).
 * 3. O payload do JWT contém o id do usuário; buscamos o User no banco e colocamos em req.user.
 * 4. Se não houver token ou for inválido, respondemos 401 Unauthorized.
 *
 * Depois desse middleware, nas rotas podemos acessar req.user (id, name, email, profile).
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mude-em-producao';

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não informado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Coloca o usuário na requisição para as rotas usarem
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    next(err);
  }
}

module.exports = auth;
