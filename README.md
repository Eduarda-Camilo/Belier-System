# Belier-System

Uma plataforma para gerenciar, documentar e versionar componentes de UI. Inclui visualização interativa, documentação técnica, histórico de versões, comentários e controle de acesso para designers, devs e administradores.

## Estrutura do repositório

- **`backend/`** — API Node.js (Express), estrutura MVC
- **`frontend/`** — aplicação React (Vite)
- **`docs/`** — documentação de escopo e domínio
- **`Projeto/`** — documento de versão final para entrega (`02-final-version.md`)

## Como rodar

### Backend

```bash
cd backend
npm install
# Configurar .env (banco, JWT etc.)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173**. Login (após seed no backend): **admin@belier.com** / **admin123**.

Consulte `backend/README.md` e `frontend/README.md` para detalhes. Escopo e entidades: `docs/escopo.md`.

**Hospedar o site (deixar público):** veja o passo a passo em `docs/DEPLOY.md` (Render.com, PostgreSQL, frontend estático).
