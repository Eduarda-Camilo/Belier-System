/**
 * Redefine a senha do usuário admin@belier.com para admin123.
 * Use se o login não funcionar (ex.: esqueceu a senha ou o seed não criou certo).
 *
 * Rodar: node src/scripts/reset-admin-password.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const ADMIN_EMAIL = 'admin@belier.com';
const NEW_PASSWORD = 'admin123';

async function reset() {
  try {
    await sequelize.sync();
    const user = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (!user) {
      console.log('Usuário admin@belier.com não encontrado. Rode primeiro: npm run seed');
      process.exit(1);
      return;
    }
    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    user.password = hash;
    await user.save();
    console.log('Senha do admin redefinida com sucesso.');
    console.log('Login: admin@belier.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

reset();
