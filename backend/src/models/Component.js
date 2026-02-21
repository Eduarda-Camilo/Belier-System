/**
 * Modelo Component (componente de UI).
 *
 * É o núcleo do sistema: cada card/botão/form que fica documentado aqui.
 * - categoryId: ligação com a categoria (FK).
 * - responsibleId: usuário responsável (designer/admin) que recebe notificações de comentários.
 * - status: draft (rascunho), published (visível), archived (arquivado).
 * - documentation: texto/HTML da documentação técnica.
 * - variations: JSON com estados/variações (ex.: { "default": "...", "disabled": "..." }).
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Component = sequelize.define('Component', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'categories', key: 'id' },
      onDelete: 'RESTRICT',
    },
    responsibleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
    },
    documentation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    usagePreview: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'HTML opcional para a aba Pré-visualização do Uso',
    },
    variations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string com estados/variações do componente',
      get() {
        const raw = this.getDataValue('variations');
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      },
      set(value) {
        this.setDataValue('variations', value ? JSON.stringify(value) : null);
      },
    },
  }, {
    tableName: 'components',
    timestamps: true,
    underscored: true,
  });

  return Component;
};
