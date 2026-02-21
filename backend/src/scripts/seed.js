/**
 * Script de seed: cria um usuário admin inicial se não existir nenhum usuário.
 *
 * Rodar uma vez após criar o banco: node src/scripts/seed.js
 * Ou adicione no package.json: "seed": "node src/scripts/seed.js"
 *
 * A senha é hasheada com bcrypt (nunca guardamos em texto puro).
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@belier.com',
  password: 'admin123',
  profile: 'admin',
};

async function seed() {
  try {
    await sequelize.sync();
    const count = await User.count();
    if (count > 0) {
      console.log('Já existem usuários no banco. Nenhum seed aplicado.');
      process.exit(0);
      return;
    }
    const hash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    await User.create({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: hash,
      profile: DEFAULT_ADMIN.profile,
    });
    console.log('Usuário admin criado: admin@belier.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Erro no seed:', err);
    process.exit(1);
  }
}

seed();
