/**
 * Modelo User (usuário).
 *
 * Representa a tabela "users". O Sequelize converte automaticamente
 * o nome do arquivo/modelo para o plural na tabela (users).
 *
 * DataTypes: define o tipo de cada coluna no banco (STRING, TEXT, INTEGER, BOOLEAN, etc.).
 * allowNull: false = campo obrigatório.
 * unique: true = não pode repetir (ex.: email).
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Senha sempre armazenada com hash (bcrypt)',
    },
    profile: {
      type: DataTypes.ENUM('admin', 'designer', 'developer'),
      allowNull: false,
      defaultValue: 'developer',
    },
  }, {
    tableName: 'users',
    timestamps: true,  // Cria automaticamente createdAt e updatedAt
    underscored: true, // Usa snake_case nas colunas (created_at, updated_at)
  });

  return User;
};
