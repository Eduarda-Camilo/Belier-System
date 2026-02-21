# Belier-System — Backend

API em Node.js (Express) para o gerenciamento de componentes, categorias, versões, comentários e notificações.

## Estrutura (MVC)

- `src/models/` — entidades e acesso ao banco
- `src/controllers/` — lógica das rotas
- `src/routes/` — definição dos endpoints
- `src/middlewares/` — autenticação e autorização
- `src/config/` — configuração (banco, env)

## Como rodar

```bash
npm install
cp .env.example .env   # edite .env se quiser (PORT, JWT_SECRET)
npm run seed           # cria usuário admin@belier.com / admin123 (só na primeira vez)
npm run dev
```

A API sobe em `http://localhost:3001`. Teste o login:

```bash
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@belier.com\",\"password\":\"admin123\"}"
```

Ver documento de escopo em `../docs/escopo.md` e explicação detalhada em `../docs/backend-explicado.md`.
