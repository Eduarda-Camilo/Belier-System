/**
 * Controller de notificações: listar (com filtros), marcar como lida, bulk read/unread.
 */

const { Op } = require('sequelize');
const { Notification, Component, Version, Example, User } = require('../models');

function parseRange(range) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  switch (range) {
    case 'today':
      return { start: new Date(start), end: new Date(now) };
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    case '7d':
      start.setDate(start.getDate() - 7);
      return { start, end: new Date(now) };
    case '15d':
      start.setDate(start.getDate() - 15);
      return { start, end: new Date(now) };
    default:
      return null;
  }
}

async function list(req, res, next) {
  try {
    const { tab = 'all', range, type, author, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const where = { userId: req.user.id };

    if (tab === 'unread') {
      where.readAt = null;
      where.read = false;
    }

    const rangeFilter = parseRange(range);
    if (rangeFilter) {
      where.createdAt = {
        [Op.between]: [rangeFilter.start, rangeFilter.end],
      };
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (author && author.trim()) {
      const authorId = parseInt(author, 10);
      if (!Number.isNaN(authorId)) where.actorUserId = authorId;
    }

    const unreadResult = await Notification.count({
      where: { userId: req.user.id, readAt: null, read: false },
    });

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      include: [
        { model: Component, as: 'Component', attributes: ['id', 'name', 'title', 'slug'], required: true },
        { model: Version, as: 'Version', attributes: ['id', 'number'], required: false },
        { model: Example, as: 'Example', attributes: ['id', 'title', 'slug'], required: false },
      ],
    });

    const items = rows.map((n) => {
      const plain = n.get ? n.get({ plain: true }) : n;
      const readAt = plain.readAt || (plain.read ? plain.createdAt : null);
      return {
        id: plain.id,
        type: plain.type || 'COMMENT_CREATED',
        componentId: plain.componentId,
        componentTitle: plain.Component?.title || plain.Component?.name || 'Componente',
        componentSlug: plain.Component?.slug,
        versionId: plain.versionId,
        versionLabel: plain.Version ? `v${plain.Version.number}` : null,
        exampleId: plain.exampleId,
        variantTitle: plain.Example?.title,
        variantSlug: plain.Example?.slug || (plain.Example?.title ? String(plain.Example.title).toLowerCase().replace(/\s+/g, '-') : null),
        commentId: plain.commentId,
        previewText: plain.previewText,
        actorName: plain.actorName,
        createdAt: plain.createdAt,
        readAt,
      };
    });

    res.json({
      items,
      total_count: count,
      unread_count: unreadResult,
      page: pageNum,
      page_count: Math.ceil(count / limitNum) || 1,
    });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user.id },
    });
    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }
    notification.readAt = new Date();
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

async function readBulk(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Envie um array de ids' });
    }
    const idList = ids.map(Number).filter((n) => n > 0);
    const [affected] = await Notification.update(
      { readAt: new Date(), read: true },
      { where: { id: idList, userId: req.user.id } }
    );
    res.json({ updated: affected, ids: idList });
  } catch (err) {
    next(err);
  }
}

async function unreadBulk(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Envie um array de ids' });
    }
    const idList = ids.map(Number).filter((n) => n > 0);
    const [affected] = await Notification.update(
      { readAt: null, read: false },
      { where: { id: idList, userId: req.user.id } }
    );
    res.json({ updated: affected, ids: idList });
  } catch (err) {
    next(err);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        [Op.or]: [{ readAt: null }, { read: false }],
      },
    });
    res.json({ unread_count: count });
  } catch (err) {
    next(err);
  }
}

async function listAuthors(req, res, next) {
  try {
    const entries = await Notification.findAll({
      attributes: ['actorUserId'],
      where: { userId: req.user.id, actorUserId: { [Op.ne]: null } },
      raw: true,
    });
    const userIds = [...new Set(entries.map((e) => e.actorUserId).filter(Boolean))];
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

module.exports = { list, markAsRead, readBulk, unreadBulk, unreadCount, listAuthors };
