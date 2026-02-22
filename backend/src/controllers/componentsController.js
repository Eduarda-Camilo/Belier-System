/**
 * Controller de componentes: CRUD + novo escopo (title, shortDescription, slug, tags, Examples).
 * Criar/editar: admin e designer; publicar/arquivar: admin; listar/ver: todos.
 */

const { Component, User, Example, Version, ChangelogEntry, Notification } = require('../models');
const { Op } = require('sequelize');

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') return { ok: false, error: 'Slug é obrigatório' };
  const s = slug.trim();
  if (s.length < 2) return { ok: false, error: 'Slug deve ter no mínimo 2 caracteres' };
  if (!SLUG_REGEX.test(s)) return { ok: false, error: 'Slug deve conter apenas letras minúsculas, números e hífen' };
  return { ok: true, value: s };
}

async function list(req, res, next) {
  try {
    const { status, q } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: term } },
        { shortDescription: { [Op.like]: term } },
        { slug: { [Op.like]: term } },
      ];
    }

    const components = await Component.findAll({
      where,
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
      order: [['title', 'ASC']],
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
            { model: Example, attributes: ['id', 'type', 'title', 'slug', 'description', 'order', 'propsTokens', 'codeSnippet', 'codeCss', 'codeJs', 'codeCustom', 'renderConfig'] },
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
    const referenceUrl = body.referenceUrl ? String(body.referenceUrl).trim() : null;
    const longDescriptionMd = body.longDescriptionMd != null ? String(body.longDescriptionMd).trim() : null;
    const dependenciesMd = body.dependenciesMd != null ? String(body.dependenciesMd).trim() : null;
    const accessibilityMd = body.accessibilityMd != null ? String(body.accessibilityMd).trim() : null;
    const importPackage = body.importPackage != null ? String(body.importPackage).trim().replace(/\s+/g, '') || null : null;
    const importName = body.importName != null ? String(body.importName).trim().replace(/\s+/g, '') || null : null;

    if (!title || title.length < 2) {
      return res.status(400).json({ error: 'Título é obrigatório (mínimo 2 caracteres)' });
    }
    if (!shortDescription || shortDescription.length < 10) {
      return res.status(400).json({ error: 'Descrição curta é obrigatória (mínimo 10 caracteres)' });
    }
    if (!tags || tags.length < 1) {
      return res.status(400).json({ error: 'Informe ao menos uma tag' });
    }
    const slugCheck = validateSlug(slug);
    if (!slugCheck.ok) return res.status(400).json({ error: slugCheck.error });
    const slugValue = slugCheck.value.toLowerCase();

    const existingSlug = await Component.findOne({ where: { slug: slugValue } });
    if (existingSlug) {
      return res.status(400).json({ error: 'Este slug já está em uso. Escolha outro.' });
    }

    const component = await Component.create({
      title,
      shortDescription,
      slug: slugValue,
      tags,
      referenceUrl,
      longDescriptionMd,
      dependenciesMd,
      accessibilityMd,
      importPackage,
      importName,
      responsibleId: req.user.id,
      status: 'draft',
    });
    const withAssociations = await Component.findByPk(component.id, {
      include: [
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
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }

    if (body.title !== undefined) {
      const t = String(body.title).trim();
      if (t.length < 2) return res.status(400).json({ error: 'Título deve ter no mínimo 2 caracteres' });
      component.title = t;
    }
    if (body.shortDescription !== undefined) {
      const d = body.shortDescription ? String(body.shortDescription).trim() : null;
      if (d !== null && d.length < 10) return res.status(400).json({ error: 'Descrição curta deve ter no mínimo 10 caracteres' });
      component.shortDescription = d;
    }
    if (body.slug !== undefined) {
      const slugCheck = validateSlug(body.slug);
      if (!slugCheck.ok) return res.status(400).json({ error: slugCheck.error });
      const slugValue = slugCheck.value.toLowerCase();
      const existingSlug = await Component.findOne({ where: { slug: slugValue, id: { [Op.ne]: id } } });
      if (existingSlug) return res.status(400).json({ error: 'Este slug já está em uso. Escolha outro.' });
      component.slug = slugValue;
    }
    if (body.tags !== undefined) {
      const t = Array.isArray(body.tags) ? body.tags : [];
      if (t.length < 1) return res.status(400).json({ error: 'Informe ao menos uma tag' });
      component.tags = t;
    }
    if (body.referenceUrl !== undefined) component.referenceUrl = body.referenceUrl ? String(body.referenceUrl).trim() : null;
    if (body.longDescriptionMd !== undefined) component.longDescriptionMd = body.longDescriptionMd != null ? String(body.longDescriptionMd).trim() : null;
    if (body.dependenciesMd !== undefined) component.dependenciesMd = body.dependenciesMd != null ? String(body.dependenciesMd).trim() : null;
    if (body.accessibilityMd !== undefined) component.accessibilityMd = body.accessibilityMd != null ? String(body.accessibilityMd).trim() : null;
    if (body.importPackage !== undefined) component.importPackage = body.importPackage != null ? String(body.importPackage).trim().replace(/\s+/g, '') || null : null;
    if (body.importName !== undefined) component.importName = body.importName != null ? String(body.importName).trim().replace(/\s+/g, '') || null : null;

    if (body.status === 'published') {
      const defaultEx = await Example.findOne({ where: { componentId: id, type: 'default' } });
      if (!defaultEx) {
        return res.status(400).json({ error: 'Não é possível publicar: cadastre o Exemplo Default com código.' });
      }
      if (!defaultEx.codeSnippet || !defaultEx.codeSnippet.trim()) {
        return res.status(400).json({ error: 'Default é obrigatório para publicar: preencha o código da variação Default.' });
      }
      component.status = 'published';
    }

    await component.save();
    const updated = await Component.findByPk(id, {
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
    res.json(updated || component);
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

async function archive(req, res, next) {
  try {
    const { id } = req.params;
    const component = await Component.findByPk(id);
    if (!component) return res.status(404).json({ error: 'Componente não encontrado' });
    component.status = 'archived';
    await component.save();
    res.json(component);
  } catch (err) {
    next(err);
  }
}

async function publish(req, res, next) {
  try {
    const { id } = req.params;
    const { changelog } = req.body;
    const component = await Component.findByPk(id, {
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name'] }],
    });
    if (!component) return res.status(404).json({ error: 'Componente não encontrado' });
    const defaultEx = await Example.findOne({ where: { componentId: id, type: 'default' } });
    if (!defaultEx || !defaultEx.codeSnippet || !defaultEx.codeSnippet.trim()) {
      return res.status(400).json({ error: 'Default é obrigatório para publicar: preencha o código da variação Default.' });
    }
    if (!changelog || !String(changelog).trim()) {
      return res.status(400).json({ error: 'Changelog é obrigatório para publicar.' });
    }
    const lastVersion = await Version.findOne({
      where: { componentId: id },
      order: [['number', 'DESC']],
    });
    const nextNumber = lastVersion ? lastVersion.number + 1 : 1;
    const examples = await Example.findAll({
      where: { componentId: id },
      order: [['type', 'ASC'], ['order', 'ASC']],
    });
    const content = {
      title: component.title,
      name: component.name,
      shortDescription: component.shortDescription,
      longDescriptionMd: component.longDescriptionMd,
      dependenciesMd: component.dependenciesMd,
      accessibilityMd: component.accessibilityMd,
      tags: component.tags,
      variationsSnapshot: examples.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        description: e.description,
        codeSnippet: e.codeSnippet,
        codeCss: e.codeCss,
        codeJs: e.codeJs,
      })),
    };
    const newVersion = await Version.create({
      componentId: id,
      userId: req.user.id,
      number: nextNumber,
      description: `Versão ${nextNumber}`,
      changelog: String(changelog).trim(),
      isPublished: true,
      content,
    });
    await ChangelogEntry.create({
      componentId: id,
      componentVersionId: newVersion.id,
      exampleId: null,
      authorUserId: req.user.id,
      authorName: req.user.name || null,
      message: String(changelog).trim(),
      changeType: 'PUBLISH',
    });
    component.status = 'published';
    await component.save();
    if (component.responsibleId && component.responsibleId !== req.user.id) {
      await Notification.create({
        userId: component.responsibleId,
        type: 'VERSION_PUBLISHED',
        componentId: id,
        versionId: newVersion.id,
        previewText: String(changelog).trim().slice(0, 300),
        actorUserId: req.user.id,
        actorName: req.user.name || null,
      });
    }
    res.json(component);
  } catch (err) {
    next(err);
  }
}

/** GET /components/:id/changelog — lista entradas de changelog do componente (Opção A: por variação, todas as versões). */
async function listComponentChangelog(req, res, next) {
  try {
    const { id } = req.params;
    const { variant_id: variantId, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const where = { componentId: id };
    if (variantId != null && variantId !== '') {
      where.exampleId = Number(variantId) || null;
    }

    const { count, rows } = await ChangelogEntry.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      include: [
        { model: Version, as: 'Version', attributes: ['id', 'number', 'isPublished', 'createdAt'] },
        { model: Example, as: 'Example', attributes: ['id', 'title', 'slug'], required: false },
      ],
    });

    const pageCount = Math.ceil(count / limitNum) || 1;
    res.json({
      items: rows,
      total_count: count,
      page: pageNum,
      page_count: pageCount,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /components/:id/record-changelog — após edição: cria versão rascunho e uma entrada de changelog por exemplo (variação) atual. */
async function recordChangelog(req, res, next) {
  try {
    const { id } = req.params;
    const { message, changedExampleIds } = req.body;
    const component = await Component.findByPk(id);
    if (!component) return res.status(404).json({ error: 'Componente não encontrado' });

    const examples = await Example.findAll({
      where: { componentId: id },
      order: [['type', 'ASC'], ['order', 'ASC']],
    });
    const defaultEx = examples.find((e) => e.type === 'default');
    const content = {
      title: component.title,
      name: component.name,
      shortDescription: component.shortDescription,
      longDescriptionMd: component.longDescriptionMd,
      dependenciesMd: component.dependenciesMd,
      accessibilityMd: component.accessibilityMd,
      tags: component.tags,
      variationsSnapshot: examples.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        description: e.description,
        codeSnippet: e.codeSnippet,
        codeCss: e.codeCss,
        codeJs: e.codeJs,
      })),
    };

    const lastVersion = await Version.findOne({
      where: { componentId: id },
      order: [['number', 'DESC']],
    });
    const nextNumber = lastVersion ? lastVersion.number + 1 : 1;
    const version = await Version.create({
      componentId: id,
      userId: req.user ? req.user.id : null,
      number: nextNumber,
      description: `Versão ${nextNumber}`,
      isPublished: false,
      content,
    });

    const authorName = req.user ? (req.user.name || null) : null;
    const authorUserId = req.user ? req.user.id : null;
    const msg = message && String(message).trim() ? String(message).trim() : 'Alteração registrada';

    const idsToRecord = Array.isArray(changedExampleIds) && changedExampleIds.length > 0
      ? changedExampleIds.map(Number).filter((n) => n && examples.some((e) => e.id === n))
      : examples.map((e) => e.id);
    if (idsToRecord.length > 0) {
      for (const exampleId of idsToRecord) {
        await ChangelogEntry.create({
          componentId: id,
          componentVersionId: version.id,
          exampleId,
          authorUserId,
          authorName,
          message: msg,
          changeType: 'EDIT',
        });
      }
    } else {
      await ChangelogEntry.create({
        componentId: id,
        componentVersionId: version.id,
        exampleId: defaultEx ? defaultEx.id : null,
        authorUserId,
        authorName,
        message: msg,
        changeType: 'EDIT',
      });
    }

    res.status(201).json({ version, message: 'Changelog registrado' });
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

module.exports = { list, getOne, create, update, remove, archive, publish, checkSlug, listComponentChangelog, recordChangelog };
