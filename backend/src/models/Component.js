/**
 * Modelo Component (componente de UI do catálogo).
 *
 * Campos principais (novo escopo): title, shortDescription, slug, tags, status.
 * Mantidos para compatibilidade: name (= title), description (= shortDescription),
 * responsibleId, documentation, usagePreview, variations.
 * - 1 Component tem 1 Example type=default e N Examples type=variation (modelo Example).
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Component = sequelize.define('Component', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Título do componente (obrigatório no novo fluxo)',
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição curta (obrigatória no novo fluxo)',
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      comment: 'Identificador único na URL (ex.: botao-primario)',
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array de strings',
      get() {
        const raw = this.getDataValue('tags');
        if (!raw) return [];
        try {
          const v = JSON.parse(raw);
          return Array.isArray(v) ? v : [];
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue('tags', value != null ? JSON.stringify(Array.isArray(value) ? value : []) : null);
      },
    },
    importPackage: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Pacote de importação (ex.: @belier/ui)',
    },
    importName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nome do export do componente (ex.: Button)',
    },
    referenceUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Link Figma / doc / repo',
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Compatibilidade: igual a title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Compatibilidade: igual a shortDescription',
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
    longDescriptionMd: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição longa em Markdown',
    },
    dependenciesMd: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dependências em Markdown',
    },
    accessibilityMd: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Acessibilidade em Markdown',
    },
    usagePreview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    variations: {
      type: DataTypes.TEXT,
      allowNull: true,
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

