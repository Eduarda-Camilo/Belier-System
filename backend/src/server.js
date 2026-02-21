/**
 * Ponto de entrada da API (servidor Express).
 *
 * Express: framework que cuida de rotas (URLs), middlewares e resposta HTTP.
 * - app.use(): registra um middleware (função que roda em toda requisição ou em certas rotas).
 * - app.get/post/put/delete(): define o que fazer quando alguém acessa uma URL com aquele método.
 *
 * Ordem importa: CORS e json() primeiro (para todas as rotas), depois as rotas da API.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares globais ---

// CORS: permite que o frontend (rodando em outro endereço, ex: localhost:5173)
// faça requisições para esta API sem o navegador bloquear.
app.use(cors());

// express.json(): interpreta o corpo (body) das requisições como JSON.
// Assim, em req.body você recebe o objeto enviado pelo cliente.
app.use(express.json());

// Monta todas as rotas em /api (ex: /api/auth/login, /api/components, etc.)
app.use('/api', routes);

// Rota de saúde: útil para testar se o servidor está no ar.
app.get('/health', (_, res) => {
  res.json({ ok: true, message: 'Belier-System API' });
});

// Middleware de erro: qualquer next(err) nas rotas cai aqui e devolve JSON
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
});

// Sobe o servidor só depois de sincronizar o banco (criar tabelas se não existirem)
const { syncDatabase } = require('./models');

syncDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar/sincronizar banco:', err);
    process.exit(1);
  });
