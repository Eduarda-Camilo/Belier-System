/**
 * Modelo Category (categoria).
 *
 * Agrupa componentes (ex.: Botões, Formulários, Navegação).
 * Um componente pertence a uma categoria (N:1).
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  });

  return Category;
};
