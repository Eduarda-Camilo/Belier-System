/**
 * Modelo Comment (comentário em um componente).
 *
 * Permite que qualquer usuário autenticado (incluindo desenvolvedores) comente
 * em um componente para tirar dúvidas ou sugerir melhorias.
 * O responsável pelo componente recebe uma notificação quando há novo comentário.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    componentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'components', key: 'id' },
      onDelete: 'CASCADE',
    },
    versionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'versions', key: 'id' },
      onDelete: 'CASCADE',
      comment: 'Comentário por versão',
    },
    exampleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'examples', key: 'id' },
      onDelete: 'CASCADE',
      comment: 'Comentário por variação (example)',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'comments', key: 'id' },
      onDelete: 'CASCADE',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
  });

  return Comment;
};
