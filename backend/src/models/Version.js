/**
 * Modelo Version (histórico de versões do componente).
 *
 * Cada vez que um componente é alterado, podemos salvar uma "versão" com
 * o número (1, 2, 3...), a descrição da alteração e um snapshot do conteúdo (content).
 * Assim mantemos histórico sem perder dados antigos.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Version = sequelize.define('Version', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    componentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'components', key: 'id' },
      onDelete: 'CASCADE', // Se o componente for apagado, apaga as versões também
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      comment: 'Quem registrou esta versão (atualizou o componente)',
    },
    variationTitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Se a atualização foi em uma variante, nome da variante',
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número da versão (1, 2, 3...)',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Snapshot dos dados do componente (JSON string)',
      get() {
        const raw = this.getDataValue('content');
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      },
      set(value) {
        this.setDataValue('content', value ? JSON.stringify(value) : null);
      },
    },
  }, {
    tableName: 'versions',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Versão não "atualiza", só cria
  });

  return Version;
};
