/**
 * Controller de componentes: CRUD + filtros (categoria, status, busca).
 * Criar/editar/excluir: admin e designer; listar/ver: todos autenticados.
 */

const { Component, Category, User } = require('../models');
const { Op } = require('sequelize');

async function list(req, res, next) {
  try {
    const { categoryId, status, q } = req.query;
    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (q && q.trim()) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q.trim()}%` } },
        { description: { [Op.like]: `%${q.trim()}%` } },
      ];
    }

    const components = await Component.findAll({
      where,
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name'] },
        { model: User, as: 'responsible', attributes: ['id', 'name', 'email'] },
      ],
      order: [['name', 'ASC']],
    });
    res.json(components);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const component = await Component.findByPk(id, {
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name', 'description'] },
        { model: User, as: 'responsible', attributes: ['id', 'name', 'email'] },
      ],
    });
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    res.json(component);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description, categoryId, status, documentation, usagePreview, variations } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!categoryId) {
      return res.status(400).json({ error: 'Categoria é obrigatória' });
    }
    const component = await Component.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      categoryId: Number(categoryId),
      responsibleId: req.user.id,
      status: status || 'draft',
      documentation: documentation ? documentation.trim() : null,
      usagePreview: usagePreview ? usagePreview.trim() : null,
      variations: variations || null,
    });
    const withAssociations = await Component.findByPk(component.id, {
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name'] },
        { model: User, as: 'responsible', attributes: ['id', 'name', 'email'] },
      ],
    });
    res.status(201).json(withAssociations);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, categoryId, status, documentation, usagePreview, variations } = req.body;
    const component = await Component.findByPk(id, {
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name'] },
        { model: User, as: 'responsible', attributes: ['id', 'name', 'email'] },
      ],
    });
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    if (name !== undefined) component.name = name.trim();
    if (description !== undefined) component.description = description ? description.trim() : null;
    if (categoryId !== undefined) component.categoryId = Number(categoryId);
    if (status !== undefined) component.status = status;
    if (documentation !== undefined) component.documentation = documentation ? documentation.trim() : null;
    if (usagePreview !== undefined) component.usagePreview = usagePreview ? usagePreview.trim() : null;
    if (variations !== undefined) component.variations = variations;
    await component.save();
    res.json(component);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const component = await Component.findByPk(id);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    await component.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
