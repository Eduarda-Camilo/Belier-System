/**
 * Controller de versões: listar versões de um componente e criar nova versão (ao editar).
 * Changelog: lista global de todas as atualizações para a tela ChangeLog.
 */

const { Op } = require('sequelize');
const { Version, Component, Example, User, ChangelogEntry } = require('../models');
const { parseRange } = require('../utils/dateRange');

async function listByComponent(req, res, next) {
  try {
    const { componentId } = req.params;
    const versions = await Version.findAll({
      where: { componentId },
      order: [['number', 'DESC']],
      include: [{ model: User, as: 'createdBy', attributes: ['id', 'name'] }],
    });
    res.json(versions);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { componentId } = req.params;
    const { description, variationTitle } = req.body;
    const component = await Component.findByPk(componentId);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    const examples = await Example.findAll({
      where: { componentId },
      order: [
        ['type', 'ASC'],
        ['order', 'ASC'],
      ],
    });
    const defaultEx = examples.find((e) => e.type === 'default');
    const variationExs = examples.filter((e) => e.type === 'variation');
    const content = {
      name: component.name,
      title: component.title,
      description: component.description,
      documentation: component.documentation,
      variations: component.variations,
      status: component.status,
      defaultCode: defaultEx ? defaultEx.codeSnippet : null,
      variationsSnapshot: variationExs.map((e) => ({
        title: e.title,
        codeSnippet: e.codeSnippet,
      })),
    };
    const lastVersion = await Version.findOne({
      where: { componentId },
      order: [['number', 'DESC']],
    });
    const nextNumber = lastVersion ? lastVersion.number + 1 : 1;
    const version = await Version.create({
      componentId: Number(componentId),
      userId: req.user ? req.user.id : null,
      number: nextNumber,
      description: description || `Versão ${nextNumber}`,
      variationTitle: variationTitle || null,
      content,
    });
    res.status(201).json(version);
  } catch (err) {
    next(err);
  }
}

async function listChangelog(req, res, next) {
  try {
    const { range, type, author, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    const rangeFilter = parseRange(range);
    if (rangeFilter) {
      where.createdAt = {
        [Op.between]: [rangeFilter.start, rangeFilter.end],
      };
    }
    if (type === 'variant') {
      where.exampleId = { [Op.ne]: null };
    } else if (type === 'component') {
      where.exampleId = null;
      where.changeType = 'EDIT';
    } else if (type === 'publish') {
      where.changeType = 'PUBLISH';
    }
    if (author && author.trim()) {
      const authorId = parseInt(author, 10);
      if (!Number.isNaN(authorId)) where.authorUserId = authorId;
    }

    const { count, rows } = await ChangelogEntry.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      include: [
        { model: Component, as: 'Component', attributes: ['id', 'name', 'title', 'slug'], required: true },
        { model: Version, as: 'Version', attributes: ['id', 'number', 'isPublished', 'content'], required: false },
        { model: Example, as: 'Example', attributes: ['id', 'title', 'slug', 'codeSnippet'], required: false },
      ],
    });

    const items = (rows || []).map((entry) => {
      const plain = entry.get ? entry.get({ plain: true }) : entry;
      const version = plain?.Version;
      return {
        id: plain.componentVersionId ?? plain.id,
        componentId: plain.componentId,
        Component: plain?.Component ?? null,
        createdAt: plain.createdAt,
        variationTitle: plain?.Example?.title ?? null,
        createdBy: { name: plain.authorName || 'Desconhecido' },
        isPublished: version?.isPublished ?? false,
        content: version?.content ?? null,
        Example: plain?.Example ?? null,
      };
    });

    const pageCount = Math.ceil(count / limitNum) || 1;
    res.json({
      items,
      total_count: count,
      page: pageNum,
      page_count: pageCount,
    });
  } catch (err) {
    console.error('[listChangelog]', err.message || err);
    next(err);
  }
}

async function listChangelogAuthors(req, res, next) {
  try {
    const entries = await ChangelogEntry.findAll({
      attributes: ['authorUserId'],
      where: { authorUserId: { [Op.ne]: null } },
      raw: true,
    });
    const userIds = [...new Set(entries.map((e) => e.authorUserId).filter(Boolean))];
    if (userIds.length === 0) return res.json([]);
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

module.exports = { listByComponent, create, listChangelog, listChangelogAuthors };
