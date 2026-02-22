/**
 * Modelo Example: representa o Exemplo Default ou uma Variação de um Componente.
 * - type: 'default' | 'variation'
 * - Exatamente 1 Example type='default' por Componente; 0..N type='variation'
 * - propsTokens: lista de chips chave:valor (ex.: ["size:sm", "disabled:true"])
 * - codeSnippet: código exibido na aba Código; pode ser gerado a partir de propsTokens ou custom
 * - codeCustom: se true, não sobrescrever codeSnippet ao alterar propsTokens
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Example = sequelize.define('Example', {
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
    type: {
      type: DataTypes.ENUM('default', 'variation'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Obrigatório para variation; para default pode ser fixo "Default"',
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Slug único dentro do componente (default = "default")',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Ordenação das variações; default usa 0',
    },
    propsTokens: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array de strings, ex.: ["size:sm", "disabled:true"]',
      get() {
        const raw = this.getDataValue('propsTokens');
        if (!raw) return [];
        try {
          const v = JSON.parse(raw);
          return Array.isArray(v) ? v : [];
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue('propsTokens', value != null ? JSON.stringify(Array.isArray(value) ? value : []) : null);
      },
    },
    codeSnippet: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    codeCss: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    codeJs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    codeCustom: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se true, codeSnippet não é regerado a partir de propsTokens',
    },
    renderConfig: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON opcional para config extra do preview',
      get() {
        const raw = this.getDataValue('renderConfig');
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      },
      set(value) {
        this.setDataValue('renderConfig', value != null ? JSON.stringify(value) : null);
      },
    },
  }, {
    tableName: 'examples',
    timestamps: true,
    underscored: true,
  });

  return Example;
};
