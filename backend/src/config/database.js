/**
 * Configuração da conexão com o banco de dados.
 *
 * - Em desenvolvimento: usa SQLite (arquivo .sqlite) se DATABASE_URL não estiver definida.
 * - Em produção/hospedagem: use DATABASE_URL (ex.: PostgreSQL do Render, Railway, etc.).
 */

const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: databaseUrl.startsWith('postgres://')
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
      logging: false,
    });

module.exports = sequelize;
