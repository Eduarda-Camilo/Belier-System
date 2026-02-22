/**
 * Controller de comentários: listar (público), criar (auth), editar próprio (auth), respostas (parentId).
 */

const { Comment, Component, User, Notification } = require('../models');
const { Op } = require('sequelize');

async function listByComponent(req, res, next) {
  try {
    const { componentId } = req.params;
    const { versionId, exampleId } = req.query;
    const where = { componentId, parentId: null };
    if (versionId != null && versionId !== '') where.versionId = Number(versionId);
    if (exampleId != null && exampleId !== '') where.exampleId = Number(exampleId);
    const comments = await Comment.findAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
        {
          model: Comment,
          as: 'replies',
          include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
          order: [['createdAt', 'ASC']],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { componentId } = req.params;
    const { text, parentId, versionId, exampleId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Texto do comentário é obrigatório' });
    }
    const component = await Component.findByPk(componentId);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    const isReply = parentId != null;
    let parentComment = null;
    if (isReply) {
      parentComment = await Comment.findOne({ where: { id: parentId, componentId } });
      if (!parentComment) return res.status(400).json({ error: 'Comentário pai não encontrado' });
    }
    const comment = await Comment.create({
      componentId: Number(componentId),
      userId: req.user.id,
      parentId: isReply ? Number(parentId) : null,
      versionId: versionId != null && versionId !== '' ? Number(versionId) : null,
      exampleId: exampleId != null && exampleId !== '' ? Number(exampleId) : null,
      text: text.trim(),
    });
    if (isReply && parentComment && parentComment.userId !== req.user.id) {
      await Notification.create({
        userId: parentComment.userId,
        commentId: comment.id,
        componentId: component.id,
        read: false,
      });
    } else if (!isReply && component.responsibleId !== req.user.id) {
      await Notification.create({
        userId: component.responsibleId,
        commentId: comment.id,
        componentId: component.id,
        read: false,
      });
    }
    const withUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
    });
    res.status(201).json(withUser);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Só é possível editar seu próprio comentário' });
    }
    if (!text || !text.trim()) return res.status(400).json({ error: 'Texto é obrigatório' });
    comment.text = text.trim();
    await comment.save();
    const withUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
    });
    res.json(withUser);
  } catch (err) {
    next(err);
  }
}

module.exports = { listByComponent, create, update };
