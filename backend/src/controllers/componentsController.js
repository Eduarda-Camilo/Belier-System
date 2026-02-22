/**
 * Controller de componentes: CRUD + novo escopo (title, shortDescription, slug, tags, Examples).
 * Criar/editar: admin e designer; publicar/arquivar: admin; listar/ver: todos.
 */

const { Component, Category, User, Example } = require('../models');
const { Op } = require('sequelize');

const SLUG_REGEX = /^[a-z0-9-]+$/;

function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') return { ok: false, error: 'Slug é obrigatório' };
  const s = slug.trim();
  if (s.length < 2) return { ok: false, error: 'Slug deve ter no mínimo 2 caracteres' };
  if (!SLUG_REGEX.test(s)) return { ok: false, error: 'Slug deve conter apenas letras minúsculas, números e hífen' };
  return { ok: true, value: s };
}

async function list(req, res, next) {
  try {
    const { categoryId, status, q } = req.query;
    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: term } },
        { description: { [Op.like]: term } },
        { title: { [Op.like]: term } },
        { shortDescription: { [Op.like]: term } },
        { slug: { [Op.like]: term } },
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
    const rawId = req.params.id;
    const id = rawId && /^\d+$/.test(String(rawId)) ? Number(rawId) : null;
    if (id == null) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    const includeExamples = req.query.include === 'examples';
    const baseInclude = [
      { model: Category, as: 'Category', attributes: ['id', 'name', 'description'] },
      { model: User, as: 'responsible', attributes: ['id', 'name', 'email'] },
    ];
    let component = await Component.findByPk(id, {
      include: baseInclude,
    });
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    if (includeExamples) {
      try {
        const withExamples = await Component.findByPk(id, {
          include: [
            ...baseInclude,
            { model: Example, attributes: ['id', 'type', 'title', 'description', 'order', 'propsTokens', 'codeSnippet', 'codeCustom', 'renderConfig'] },
          ],
        });
        if (withExamples && withExamples.Examples) {
          const defaultEx = withExamples.Examples.find((e) => e.type === 'default') || null;
          const variations = withExamples.Examples.filter((e) => e.type === 'variation').sort((a, b) => a.order - b.order);
          withExamples.dataValues.defaultExample = defaultEx;
          withExamples.dataValues.variations = variations;
          delete withExamples.dataValues.Examples;
          component = withExamples;
        }
      } catch (_) {
        // Tabela examples pode não existir ou associação falhar; segue com componente sem exemplos
      }
    }
    const plain = component.get ? component.get({ plain: true }) : component;
    res.json(plain);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const body = req.body;
    const title = body.title != null ? String(body.title).trim() : (body.name && String(body.name).trim());
    const shortDescription = body.shortDescription != null ? String(body.shortDescription).trim() : (body.description && String(body.description).trim());
    const slug = body.slug != null ? String(body.slug).trim() : '';
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const categoryId = body.categoryId != null ? Number(body.categoryId) : null;
    const status = body.status || 'draft';
    const importName = body.importName ? String(body.importName).trim() : null;
    const referenceUrl = body.referenceUrl ? String(body.referenceUrl).trim() : null;

    if (!title || title.length < 2) {
      return res.status(400).json({ error: 'Título é obrigatório (mínimo 2 caracteres)' });
    }
    if (!shortDescription || shortDescription.length < 10) {
      return res.status(400).json({ error: 'Descrição curta é obrigatória (mínimo 10 caracteres)' });
    }
    const slugCheck = validateSlug(slug);
    if (!slugCheck.ok) return res.status(400).json({ error: slugCheck.error });
    const slugValue = slugCheck.value;

    const existingSlug = await Component.findOne({ where: { slug: slugValue } });
    if (existingSlug) {
      return res.status(400).json({ error: 'Este slug já está em uso. Escolha outro.' });
    }

    const component = await Component.create({
      title,
      shortDescription,
      slug: slugValue,
      tags,
      importName,
      referenceUrl,
      name: title,
      description: shortDescription,
      categoryId: categoryId != null ? Number(categoryId) : null,
      responsibleId: req.user.id,
      status,
    });
    const withAssociations = await Component.findByPk(component.id, {
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name'] },
        { model: User, as: 'responsible', attributes: ['id', 'name', 'email'] },
      ],
    });
    res.status(201).json(withAssociations);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError' && err.fields && err.fields.slug) {
      return res.status(400).json({ error: 'Este slug já está em uso. Escolha outro.' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body;
    const component = await Component.findByPk(id, {
      include: [
        { model: Category, as: 'Category', attributes: ['id', 'name'] },
        { model: User, as: 'responsible', attributes: ['id', 'name', 'email'] },
      ],
    });
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }

    if (body.title !== undefined) {
      const t = String(body.title).trim();
      if (t.length < 2) return res.status(400).json({ error: 'Título deve ter no mínimo 2 caracteres' });
      component.title = t;
      component.name = t;
    }
    if (body.shortDescription !== undefined) {
      const d = body.shortDescription ? String(body.shortDescription).trim() : null;
      if (d !== null && d.length < 10) return res.status(400).json({ error: 'Descrição curta deve ter no mínimo 10 caracteres' });
      component.shortDescription = d;
      component.description = d;
    }
    if (body.slug !== undefined) {
      const slugCheck = validateSlug(body.slug);
      if (!slugCheck.ok) return res.status(400).json({ error: slugCheck.error });
      const slugValue = slugCheck.value;
      const existingSlug = await Component.findOne({ where: { slug: slugValue, id: { [Op.ne]: id } } });
      if (existingSlug) return res.status(400).json({ error: 'Este slug já está em uso. Escolha outro.' });
      component.slug = slugValue;
    }
    if (body.tags !== undefined) component.tags = Array.isArray(body.tags) ? body.tags : component.tags;
    if (body.importName !== undefined) component.importName = body.importName ? String(body.importName).trim() : null;
    if (body.referenceUrl !== undefined) component.referenceUrl = body.referenceUrl ? String(body.referenceUrl).trim() : null;
    if (body.categoryId !== undefined) component.categoryId = body.categoryId ? Number(body.categoryId) : null;

    if (body.status !== undefined) {
      if (body.status === 'published') {
        const defaultEx = await Example.findOne({ where: { componentId: id, type: 'default' } });
        if (!defaultEx) {
          return res.status(400).json({ error: 'Não é possível publicar: cadastre o Exemplo Default com código ou props.' });
        }
        if (!defaultEx.codeSnippet || !defaultEx.codeSnippet.trim()) {
          const tokens = defaultEx.propsTokens || [];
          if (tokens.length === 0) {
            return res.status(400).json({ error: 'Não é possível publicar: o Exemplo Default precisa de código ou props.' });
          }
        }
      }
      component.status = body.status;
    }

    await component.save();
    res.json(component);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError' && err.fields && err.fields.slug) {
      return res.status(400).json({ error: 'Este slug já está em uso. Escolha outro.' });
    }
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

async function checkSlug(req, res, next) {
  try {
    const { slug } = req.query;
    const excludeId = req.query.excludeId ? Number(req.query.excludeId) : null;
    const slugCheck = validateSlug(slug);
    if (!slugCheck.ok) {
      return res.json({ available: false, error: slugCheck.error });
    }
    const where = { slug: slugCheck.value };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Component.findOne({ where });
    res.json({ available: !existing });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, checkSlug };
