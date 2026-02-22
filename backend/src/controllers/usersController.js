/**
 * Controller de usuários: listar, criar e atualizar (apenas admin).
 * Na criação, a senha é hasheada com bcrypt.
 */

const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function list(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'profile', 'createdAt'],
      order: [['name', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, password, profile } = req.body;
    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      profile: profile || 'developer',
    });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, password, profile } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (profile !== undefined) user.profile = profile;
    if (password && password.trim()) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }
    await user.save();
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, destroy };
