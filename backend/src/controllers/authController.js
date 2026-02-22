/**
 * Controller de autenticação: login.
 *
 * Recebe email e senha no body, valida, e devolve um JWT para o cliente
 * usar no header Authorization nas próximas requisições.
 *
 * A senha NUNCA é armazenada em texto puro: usamos bcrypt.hash ao criar usuário
 * e bcrypt.compare aqui para verificar se a senha está correta.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-mude-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const emailTrim = email && String(email).trim().toLowerCase();
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!emailTrim) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
    }

    const existing = await User.findOne({ where: { email: emailTrim } });
    if (existing) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: emailTrim,
      password: hashedPassword,
      profile: 'developer',
    });

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Gera o token com o id do usuário (e opcionalmente profile) no payload
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Devolve o token e os dados do usuário (sem a senha)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register };
