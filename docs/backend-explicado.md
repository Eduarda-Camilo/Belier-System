# Backend Belier-System — O que cada parte faz

Este documento explica, em ordem, o que foi implementado na Fase 2 e **por que** cada coisa existe.

---

## 1. Dependências (`package.json`)

| Pacote      | Função |
|------------|--------|
| **express** | Framework HTTP: rotas (get, post, put, delete), middlewares, envio de JSON. |
| **cors**    | Permite que o frontend (outra origem, ex: `localhost:5173`) chame esta API sem o navegador bloquear. |
| **dotenv**  | Carrega variáveis do arquivo `.env` (PORT, JWT_SECRET, DATABASE_PATH) em `process.env`. |
| **sequelize** | ORM: em vez de escrever SQL, definimos **modelos** (User, Component, etc.) e o Sequelize cria tabelas e consultas. |
| **sqlite3** | Driver do banco SQLite (arquivo único, não precisa instalar servidor de banco). |
| **bcryptjs** | Hash de senhas: nunca guardamos senha em texto puro; ao criar usuário fazemos `hash(senha)` e ao login `compare(senha, hash)`. |
| **jsonwebtoken** | Geração e verificação de JWT: no login devolvemos um **token**; o cliente envia esse token no header e nós sabemos quem é o usuário. |

---

## 2. Configuração do banco (`src/config/database.js`)

- Lê `DATABASE_PATH` do `.env` (ou usa `database.sqlite` na pasta `backend`).
- Cria uma instância do **Sequelize** apontando para esse arquivo SQLite.
- Qualquer modelo que use `sequelize.define()` vai usar essa conexão; o `sync()` cria as tabelas no disco.

---

## 3. Servidor (`src/server.js`)

- **Carrega o `.env`** no início.
- Cria o **app Express** e usa dois middlewares globais:
  - **cors()**: libera requisições do frontend.
  - **express.json()**: transforma o corpo (body) das requisições em objeto JavaScript (`req.body`).
- **Monta todas as rotas em `/api`**: então login fica `POST /api/auth/login`, componentes em `GET /api/components`, etc.
- **Rota `/health`**: só para testar se a API está no ar.
- **Middleware de erro**: quando qualquer rota chama `next(err)`, essa função devolve um JSON com a mensagem de erro e status 500 (ou o que vier em `err.status`).
- **Antes de subir a porta**: chama `syncDatabase()`, que cria as tabelas no SQLite se ainda não existirem; só depois inicia o `app.listen(PORT)`.

---

## 4. Modelos (`src/models/`)

Cada arquivo define uma **tabela** e seus campos.

- **User**: nome, email (único), senha (hash), perfil (`admin` / `designer` / `developer`). Usado no login e na autorização.
- **Category**: nome e descrição. Agrupa componentes (ex.: Botões, Formulários).
- **Component**: nome, descrição, categoria, responsável (FK para User), status (draft/published/archived), documentação, variações (JSON). É o “card” do design system.
- **Version**: número da versão, descrição, snapshot do componente (content em JSON). Histórico de alterações.
- **Comment**: texto, componente (FK), usuário autor (FK). Comentários por componente.
- **Notification**: usuário que recebe (FK), comentário (FK), componente (FK), `read` (boolean). Criada quando alguém comenta e o responsável do componente é outro usuário.

O **`models/index.js`**:
- Conecta o Sequelize ao banco.
- Carrega cada modelo (User, Category, Component, etc.).
- Define os **relacionamentos** (belongsTo / hasMany): por exemplo, Component pertence a Category e a User (responsável); Comment pertence a Component e a User; etc.
- Exporta `sequelize`, todos os modelos e a função `syncDatabase()` para o servidor usar.

---

## 5. Autenticação e autorização

### 5.1 Login (`controllers/authController.js`)

- Recebe `email` e `password` no body.
- Busca o usuário pelo email; compara a senha com **bcrypt.compare**.
- Se estiver certo, gera um **JWT** com `userId` no payload e devolve `{ token, user }` (sem senha).
- O frontend guarda o token e envia no header: `Authorization: Bearer <token>`.

### 5.2 Middleware `auth` (`middlewares/auth.js`)

- Lê o header `Authorization`, extrai o token e usa **jwt.verify** com `JWT_SECRET`.
- Pega o `userId` do payload e carrega o **User** no banco; coloca em **req.user**.
- Se não houver token ou for inválido, responde **401**.

### 5.3 Middleware `authorize(...profiles)` (`middlewares/authorize.js`)

- Usado **depois** do `auth`.
- Verifica se `req.user.profile` está na lista permitida (ex.: `authorize('admin', 'designer')`).
- Se não estiver, responde **403** (sem permissão).

Assim, uma rota como “editar componente” fica: `auth` (garante logado) + `authorize('admin', 'designer')` (garante perfil certo).

---

## 6. Rotas e controllers

Cada recurso tem um arquivo em **`routes/`** e um em **`controllers/`**.

- **auth**: `POST /api/auth/login`, `GET /api/auth/me` (usuário atual pelo token).
- **categories**: GET (listar), POST/PUT/DELETE (admin/designer).
- **components**: GET (listar com filtros `categoryId`, `status`, `q`), GET `/:id`, POST/PUT (admin/designer), DELETE (só admin).
- **versions**: GET `component/:componentId` (listar versões), POST `component/:componentId` (criar versão; admin/designer).
- **comments**: GET `component/:componentId` (listar), POST `component/:componentId` (criar; ao criar, gera notificação para o responsável do componente).
- **notifications**: GET (listar do usuário), PUT `/:id/read`, POST `read-all`.
- **users**: GET (listar), POST, PUT (apenas admin).

Os **controllers** usam os modelos (Sequelize) para ler/escrever no banco e respondem com `res.json()` ou `res.status(...).send()`.

---

## 7. Seed (`src/scripts/seed.js`)

- Sincroniza o banco e verifica se já existe algum usuário.
- Se não existir, cria um usuário **admin**: email `admin@belier.com`, senha `admin123`.
- A senha é hasheada com **bcrypt** antes de salvar.

**Como usar:** na pasta `backend`, criar o `.env` (copiar do `.env.example`), rodar `npm run seed` uma vez e depois `npm run dev` para subir a API. O login com `admin@belier.com` / `admin123` passa a funcionar.

---

## Resumo do fluxo de uma requisição

1. Cliente envia, por exemplo, `GET /api/components` com header `Authorization: Bearer <token>`.
2. **CORS** e **json()** processam a requisição.
3. A rota `/api/components` é tratada por **components.js**.
4. O middleware **auth** valida o token e coloca o usuário em **req.user**.
5. O **controller** `componentsController.list` usa os modelos para buscar no banco e devolve **res.json(components)**.
6. Se em algum passo der erro, o **middleware de erro** no `server.js` devolve um JSON com a mensagem e o status adequado.

Assim você tem uma API REST com autenticação JWT, autorização por perfil e CRUD de categorias, componentes, versões, comentários, notificações e usuários, pronta para o frontend React consumir.
