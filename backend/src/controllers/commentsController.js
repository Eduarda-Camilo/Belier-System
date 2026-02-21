/**
 * Controller de comentários: listar por componente e criar comentário.
 * Ao criar um comentário, criamos uma notificação para o responsável do componente.
 */

const { Comment, Component, User, Notification } = require('../models');

async function listByComponent(req, res, next) {
  try {
    const { componentId } = req.params;
    const comments = await Comment.findAll({
      where: { componentId },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
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
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Texto do comentário é obrigatório' });
    }
    const component = await Component.findByPk(componentId);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    const comment = await Comment.create({
      componentId: Number(componentId),
      userId: req.user.id,
      text: text.trim(),
    });
    // Notifica o responsável (se não for o próprio autor do comentário)
    if (component.responsibleId !== req.user.id) {
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

module.exports = { listByComponent, create };
