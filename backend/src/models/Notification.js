/**
 * Modelo Notification (notificação para o usuário).
 *
 * Criada quando alguém comenta em um componente: o responsável (responsibleId)
 * do componente recebe uma notificação. O campo "read" indica se já foi lida.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'comments', key: 'id' },
      onDelete: 'CASCADE',
    },
    componentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'components', key: 'id' },
      onDelete: 'CASCADE',
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  });

  return Notification;
};
