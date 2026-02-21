/**
 * Controller de notificações: listar as do usuário logado e marcar como lida.
 */

const { Notification, Comment, Component, User } = require('../models');

async function list(req, res, next) {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Comment,
          as: 'Comment',
          attributes: ['id', 'text', 'createdAt'],
          include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
        },
        { model: Component, as: 'Component', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json(notifications);
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
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );
    res.json({ message: 'Todas marcadas como lidas' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, markAsRead, markAllAsRead };
