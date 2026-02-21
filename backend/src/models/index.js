/**
 * Índice dos modelos: carrega o Sequelize, define todas as tabelas e seus relacionamentos.
 *
 * Por que um index? Assim, em qualquer lugar do código fazemos:
 *   const { User, Component, sequelize } = require('../models');
 * e temos acesso aos modelos já conectados e com as associations definidas.
 *
 * Associations (relacionamentos):
 * - Component pertence a Category e ao User (responsável).
 * - Version e Comment pertencem a Component; Comment pertence a User.
 * - Notification pertence a User, Comment e Component (para saber quem, em qual comentário e em qual componente).
 */

const sequelize = require('../config/database');

// Carrega cada modelo passando a instância do Sequelize.
// A ordem importa: primeiro os que não dependem de outros (User, Category).
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Component = require('./Component')(sequelize);
const Example = require('./Example')(sequelize);
const Version = require('./Version')(sequelize);
const Comment = require('./Comment')(sequelize);
const Notification = require('./Notification')(sequelize);

// --- Relacionamentos ---

// Componente pertence a uma Categoria e tem um Usuário responsável
Component.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Component, { foreignKey: 'categoryId' });

Component.belongsTo(User, { as: 'responsible', foreignKey: 'responsibleId' });
User.hasMany(Component, { foreignKey: 'responsibleId' });

Example.belongsTo(Component, { foreignKey: 'componentId' });
Component.hasMany(Example, { foreignKey: 'componentId' });

// Versão e Comentário pertencem a um Componente
Version.belongsTo(Component, { foreignKey: 'componentId' });
Component.hasMany(Version, { foreignKey: 'componentId' });

Comment.belongsTo(Component, { foreignKey: 'componentId' });
Component.hasMany(Comment, { foreignKey: 'componentId' });

// Comentário pertence a um Usuário (autor)
Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

// Respostas: comentário pode ter parentId (resposta a outro comentário)
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });

// Notificação: para um User, referente a um Comment e um Component
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(Comment, { foreignKey: 'commentId' });
Comment.hasMany(Notification, { foreignKey: 'commentId' });
Notification.belongsTo(Component, { foreignKey: 'componentId' });
Component.hasMany(Notification, { foreignKey: 'componentId' });

/**
 * Sincroniza o banco: cria as tabelas se não existirem (sync).
 * Em produção (DATABASE_URL), usa alter: true para adicionar colunas novas (ex.: parentId em comments).
 */
async function syncDatabase(options = {}) {
  const alter = Boolean(process.env.DATABASE_URL);
  await sequelize.sync({ ...options, alter });
}

module.exports = {
  sequelize,
  User,
  Category,
  Component,
  Example,
  Version,
  Comment,
  Notification,
  syncDatabase,
};
