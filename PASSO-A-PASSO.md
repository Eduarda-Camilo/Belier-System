# Passo a passo — Belier-System (Trabalho Final CSI606)

Este documento orienta a conclusão do projeto **Belier-System** (Design System / Component Library Manager) conforme o roteiro do trabalho final e os critérios de avaliação da disciplina.

---

## Resumo dos critérios de avaliação (para orientar o desenvolvimento)

| Área | Pontos | Itens avaliados |
|------|--------|------------------|
| **Backend** | 40 | Escopo/domínio (10), Funcionalidades (15), Frameworks/MVC (15) |
| **Frontend** | 40 | Interfaces (15), Uso correto das tecnologias (25) |
| **Avaliação pelos pares** | 10 | Participação na avaliação dos outros trabalhos |

**Stack definida:** Frontend em **React**, Backend em **Node**.

---

## Fase 1 — Planejamento e estrutura do repositório

### 1.1 Definir escopo e requisitos (Backend — 10 pts)

- [ ] Documentar o **domínio** do sistema em um arquivo (ex.: `docs/escopo.md` ou no próprio `02-final-version.md`):
  - Entidades: **Usuário**, **Componente**, **Categoria**, **Versão**, **Comentário**, **Notificação**
  - Regras de negócio: perfis (Admin, Designer, Desenvolvedor), permissões por ação
- [ ] Listar **requisitos funcionais** alinhados ao tema (CRUD de componentes, comentários, histórico de versões, notificações, controle de acesso).
- [ ] Criar a pasta sugerida pelo roteiro: `Projeto/` e o arquivo `Projeto/02-final-version.md` para a versão final e resultados (pode ser preenchido ao longo do projeto e finalizado na entrega).

### 1.2 Estrutura do projeto

- [ ] Organizar o repositório em **monorepo** ou **dois projetos**:
  - `backend/` — API Node (Express ou similar)
  - `frontend/` — aplicação React
- [ ] Adicionar um `README.md` na raiz explicando como rodar backend e frontend (comandos de instalação e execução).

---

## Fase 2 — Backend (Node)

### 2.1 Configuração inicial

- [ ] Inicializar o projeto Node em `backend/` (`npm init`).
- [ ] Instalar e configurar:
  - **Express** (ou Fastify) para rotas e middleware
  - **ORM ou query builder** (ex.: Sequelize, Prisma ou Knex) para banco de dados
  - **Banco de dados**: SQLite (mais simples) ou PostgreSQL/MySQL
  - Variáveis de ambiente (ex.: `dotenv`) para conexão e segredo
- [ ] Estruturar seguindo **MVC** (ou padrão equivalente):
  - `models/` — entidades (User, Component, Category, Version, Comment, Notification)
  - `controllers/` — lógica das rotas
  - `routes/` — definição dos endpoints
  - `middlewares/` — autenticação, autorização por perfil

### 2.2 Modelagem e persistência

- [ ] Criar **modelos** (e migrações, se usar ORM com migrations):
  - **User**: id, nome, email, senha (hash), perfil (admin/designer/developer), timestamps
  - **Component**: id, nome, descrição, categoriaId, responsável (userId), status (rascunho/publicado/arquivado), timestamps
  - **Category**: id, nome, descrição
  - **Version**: id, componentId, número da versão, descrição da alteração, conteúdo/dados da versão, createdAt
  - **Comment**: id, componentId, userId, texto, createdAt
  - **Notification**: id, userId, commentId ou componentId, lida (boolean), createdAt
- [ ] Definir **relacionamentos** (componente → categoria, componente → versões, componente → comentários, comentário → usuário, etc.).

### 2.3 Autenticação e autorização

- [ ] Implementar **autenticação** (ex.: JWT com login por email/senha).
- [ ] Implementar **middleware de autorização** por perfil:
  - **Admin**: CRUD componentes, gerenciar usuários, publicar/arquivar
  - **Designer**: criar/editar componentes, documentação, variações; receber notificações de comentários
  - **Desenvolvedor**: apenas leitura + comentários (sem editar/excluir componentes)

### 2.4 API REST — Funcionalidades (Backend — 15 pts)

- [ ] **CRUD de componentes** (create, read, update, delete) com validação e regras de perfil.
- [ ] **Categorias**: listar e, se no escopo, CRUD (admin/designer).
- [ ] **Histórico de versões**: listar versões de um componente; criar nova versão ao editar (designer/admin).
- [ ] **Comentários**: listar comentários de um componente; criar comentário (todos autenticados); opcional: editar/excluir próprio comentário.
- [ ] **Notificações**: criar notificação quando houver novo comentário (para responsável do componente); endpoint para listar e marcar como lida.
- [ ] **Usuários** (admin): listar, criar, editar perfil/permissões, desativar (conforme escopo).
- [ ] **Filtros e busca**: query params para filtrar componentes por categoria, status, busca por nome/descrição.

Documentar os endpoints (lista em `02-final-version.md` ou em `docs/api.md`) para demonstrar o escopo implementado.

---

## Fase 3 — Frontend (React)

### 3.1 Configuração inicial

- [ ] Criar aplicação React em `frontend/` (Vite + React ou Create React App).
- [ ] Instalar e configurar:
  - **Roteamento**: React Router
  - **Requisições HTTP**: axios ou fetch (ou React Query para cache e estado do servidor)
  - **Estado global** (se necessário): Context API ou Redux/Zustand
  - **UI/estilização**: CSS Modules, Styled Components, Tailwind ou biblioteca de componentes (MUI, Chakra, etc.) — alinhado ao “uso correto das tecnologias”)

### 3.2 Autenticação no frontend

- [ ] Tela de **login** (e, se no escopo, registro).
- [ ] Armazenar token (ex.: localStorage ou cookie) e enviar no header das requisições.
- [ ] Redirecionar usuário não autenticado para login; exibir menu/links conforme perfil (admin/designer/desenvolvedor).

### 3.3 Interfaces e funcionalidades (Frontend — 15 pts interfaces, 25 pts tecnologias)

- [ ] **Layout geral**: cabeçalho, menu/navegação, área de conteúdo; uso correto de componentes React e rotas.
- [ ] **Listagem de componentes**:
  - Grid ou lista de cards com nome, categoria, status, responsável
  - Filtros (categoria, status) e busca por texto
  - Botões de ação conforme perfil (novo, editar, excluir apenas para quem pode)
- [ ] **Detalhe do componente**:
  - Visualização dos dados (nome, descrição, categoria, documentação)
  - **Visualização interativa** (iframe ou área dedicada) para mostrar o componente com estados/variações, se aplicável
  - Exemplos de uso (código ou descrição)
  - Aba ou seção de **histórico de versões** (lista com link para ver versão anterior)
  - Aba ou seção de **comentários** (lista e formulário para novo comentário)
- [ ] **Formulário de componente** (criar/editar): campos nome, descrição, categoria, documentação, variações/estados (conforme modelo do backend); disponível para admin e designer.
- [ ] **Notificações**: ícone no cabeçalho com contador; dropdown ou página listando notificações e opção “marcar como lida”.
- [ ] **Categorias** (se no escopo): página de listagem e formulário para admin/designer.
- [ ] **Gestão de usuários** (admin): listagem, formulário de criação/edição de usuário e perfil.

Garantir que as telas sejam **funcionais** (integradas à API), **claras** e **responsivas** quando fizer sentido.

---

## Fase 4 — Integração e polish

- [ ] Conectar todas as telas do frontend aos endpoints do backend (tratamento de loading, erro e sucesso).
- [ ] Revisar **controle de acesso**: botões e rotas ocultos ou desabilitados conforme perfil.
- [ ] Testar fluxos principais: login, CRUD componente, comentário, notificação, filtros e histórico de versões.
- [ ] Atualizar **README** com instruções de instalação (backend e frontend), variáveis de ambiente e como rodar o banco.
- [ ] Preencher **`Projeto/02-final-version.md`** com:
  - Descrição final do projeto
  - Escopo implementado (lista de funcionalidades)
  - Como executar o projeto
  - Endpoints principais (ou link para documentação da API)
  - Resultados/screenshots (opcional mas recomendado para a apresentação)

---

## Fase 5 — Entrega (sem parte do vídeo)

- [ ] **GitHub**: código final commitado; documento `Projeto/02-final-version.md` atualizado.
- [ ] Revisar critérios do roteiro: backend (escopo, funcionalidades, MVC/frameworks), frontend (interfaces, tecnologias).

---

## Checklist rápido por critério

| Critério | O que verificar |
|----------|------------------|
| Escopo/domínio (10) | Documentação clara das entidades e regras; alinhamento com o tema do projeto |
| Funcionalidades (15) | CRUD componentes, categorias, versões, comentários, notificações, filtros, perfis |
| MVC/Frameworks (15) | Estrutura models/controllers/routes no backend; uso de Express e ORM |
| Interfaces (15) | Telas completas, navegação, formulários e listagens funcionais |
| Tecnologias (25) | React (componentes, rotas, estado), Node (API REST), uso correto das libs |

---

## Ordem sugerida de implementação

1. Backend: estrutura MVC, modelos e banco → autenticação → CRUD componentes e categorias → versões → comentários e notificações → usuários e filtros.  
2. Frontend: projeto React, login, layout → listagem e detalhe de componentes → formulário criar/editar → comentários e notificações → categorias e usuários (admin) → integração e testes.

Seguindo este passo a passo, o projeto fica alinhado ao roteiro do trabalho final e ao tema do Belier-System. A parte do vídeo no YouTube fica por sua conta no final, conforme o roteiro.
