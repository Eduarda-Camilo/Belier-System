/**
 * Controller de categorias: listar, criar, atualizar e excluir.
 * Conforme o escopo, admin e designer podem gerenciar categorias.
 */

const { Category } = require('../models');

async function list(req, res, next) {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : null,
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description ? description.trim() : null;
    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    await category.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
