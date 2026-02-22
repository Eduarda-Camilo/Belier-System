/**
 * Entrada de changelog por variação/versão.
 * Uma entrada por alteração (edição ou publicação) associada a component_id, version_id e variant (example_id).
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChangelogEntry = sequelize.define('ChangelogEntry', {
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
    componentVersionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'versions', key: 'id' },
      onDelete: 'SET NULL',
    },
    exampleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'examples', key: 'id' },
      onDelete: 'SET NULL',
      comment: 'Variação (subcomponente) afetada; null = apenas docs/publicação',
    },
    authorUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    authorName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    changeType: {
      type: DataTypes.ENUM('EDIT', 'PUBLISH'),
      allowNull: false,
      defaultValue: 'EDIT',
    },
  }, {
    tableName: 'changelog_entries',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });

  return ChangelogEntry;
};
