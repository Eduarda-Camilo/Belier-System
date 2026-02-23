# Belier System — Plano de implementação (passo a passo)

Este documento traduz a especificação final em **ordem de execução** para deixar o sistema funcional **sem alterar layout, cores ou estrutura visual**. Backend no Render, front no Vercel.

---

## Resumo do que entendi

- **O que é:** Portal de biblioteca de componentes (design system): cadastro/edição de componentes, documentação (import, variáveis), preview real no app, comentários por variável (logado), changelog por variável (logado), gestão de usuários (Admin).
- **O que NÃO fazer:** Mudar layout/UI, criar aprovação, comentários públicos, executar código do banco, criar páginas/entidades fora da spec.
- **Regras fixas:** Apenas Open Sans; edição direta (Salvar → reflete); preview via registry (previewProps + previewChildren), não iframe/código do banco.

---

## Fase 0 — Preparação (sem mudar comportamento visível)

### 0.1 Backend (Render)

- Garantir que a API no Render expõe (ou será implementada com) os recursos da spec:
  - **Componentes:** CRUD, slug único, campos da spec (name, slug, description, importDescription, importSnippetIndividual, importSnippetGlobal, createdAt, createdBy, updatedAt, updatedBy).
  - **Variantes:** CRUD por componente (title, description, codeSnippet, previewChildren, previewProps, orderIndex), sempre existir "Default".
  - **Comentários:** por variantId, authorId, text (limite 800).
  - **SaveEvent:** ao salvar componente com mudança real (payloadHash ou diff).
  - **ChangelogEntry:** por SaveEvent, 1 por Default + 1 por variável, com snapshot e metadado (autor, hora, data).
  - **Usuários e roles:** Admin / Designer / Dev; auth (login/sessão ou JWT).
- Definir base URL da API (ex.: `https://<app>.onrender.com`) e CORS liberado para o domínio do Vercel.

### 0.2 Front — Configuração e documentação

- **Variável de ambiente:** `VITE_API_URL` (ou similar) apontando para a API no Render.
- **ROTAS.md:** Atualizar conforme spec:
  - Button = componente cadastrado: interno `/components/button`, público `/components/button-public`.
  - `/` e `/button` = redirect (logado → `/components/button`, não logado → `/components/button-public`).
  - Documentar rotas oficiais: `/components/:slug`, `/components/:slug-public`, `/docs`, `/docs-public`, `/novo-componente`, `/editar-componente/:componentId`, `/inbox`, `/changelog`, `/usuarios`.
  - Changelog vazio = mesmo `/changelog`, estado vazio na mesma rota; `/changelog-empty` só como rota interna de teste, sem link no menu.
  - Design: **apenas Open Sans** (remover Roboto Flex da doc).
- **Tipografia:** Manter arquivos de fonte existentes por enquanto; na fase de “polimento” trocar referências visuais para Open Sans somente (sem mudar layout).

---

## Fase 1 — Autenticação e usuário

### 1.1 Camada de API no front

- Criar cliente HTTP (fetch ou axios) com base URL da env.
- Endpoints de auth: login (e opcionalmente refresh/logout) conforme o backend.
- Guardar sessão (token/session) de forma segura (ex.: memória + cookie httpOnly se o backend enviar; ou apenas token em memória/localStorage conforme decisão de segurança).

### 1.2 Estado “logado” e perfil

- Contexto (ou store) de auth: usuário logado, role (Admin / Designer / Dev), e métodos login/logout.
- Página de login existente: conectar formulário ao endpoint de login; em sucesso, guardar sessão e redirecionar (ex.: `/docs` ou `/components/button`).
- Esconder/mostrar itens do menu conforme role:
  - **Admin:** vê tudo, inclusive link para `/usuarios`.
  - **Designer:** não mostra link `/usuarios`.
  - **Dev:** não mostra `/usuarios` e não mostra “Novo componente” (ou desabilita criação de componente).

### 1.3 Redirects de compatibilidade

- Rota `/`: componente que verifica se está logado → redirect para `/components/button` ou `/components/button-public`.
- Rota `/button`: mesmo critério → redirect para `/components/button` ou `/components/button-public`.
- Sem alterar layout; apenas lógica de navegação.

---

## Fase 2 — Componentes dinâmicos (rotas e dados)

### 2.1 Rotas por slug

- **Interno (logado):** `/components/:slug` → carrega componente pelo slug na API e exibe a mesma tela de documentação atual (Button), mas com dados do backend.
- **Público:** `/components/:slug-public` → mesma tela, dados do backend, sem comentários e sem ações de edição.
- Manter página “Button” atual como **template**: mesmo layout; trocar apenas a fonte dos dados (estado mock → API).

### 2.2 Slug

- No backend: slug derivado do nome (minúsculo, sem acentos, espaços → `-`, sem caracteres especiais; se duplicado, sufixo `-2`, `-3`).
- No front: ao listar ou redirecionar, usar sempre o slug retornado pela API (não recalcular no front).

### 2.3 Listagem de componentes (sidebar / docs)

- Onde hoje aparece “Button” fixo, passar a listar componentes vindos da API (por slug/nome).
- Links: interno → `/components/:slug`, público → `/components/:slug-public`.
- Ordem: conforme backend (ex.: ordem de criação ou campo orderIndex).

---

## Fase 3 — Novo componente e editar componente

### 3.1 Novo Componente (`/novo-componente`)

- Formulário atual: manter 100% do layout (Informações básicas, Import, Variáveis).
- Conectar campos aos dados da spec:
  - Nome (1–60), Descrição (até 600), Import (descrição até 1200, snippets Individual/Global sem limite).
  - Variáveis: sempre “Default” + variáveis adicionadas; por variável: título (1–40), descrição (até 300), código, previewProps (JSON), previewChildren (opcional).
- Validação: campos com `*` obrigatórios; bloquear Salvar se inválido.
- Ao Salvar:
  - Criar Component + Variant Default + demais Variants na API.
  - Se houve mudança real → criar SaveEvent + ChangelogEntries (1 Default + 1 por variável).
- Cancelar → voltar para lista/docs ou `/components/button` (comportamento atual).

### 3.2 Editar Componente (`/editar-componente/:componentId`)

- Mesmo layout da tela de edição existente; carregar dados do componente (e variáveis) pela API.
- **Permissões de campo:**
  - **Admin/Designer:** editam tudo (nome, descrição, import, variáveis, excluir).
  - **Dev:** só editam: Import (importDescription, importSnippetIndividual, importSnippetGlobal); por variável e Default: codeSnippet, previewProps, previewChildren. Não editam nome do componente, descrição do componente, título/descrição das variáveis, nem excluem componente.
- Desabilitar ou esconder campos/buttons conforme role (sem mudar layout da caixa).

### 3.3 Unicidade de slug

- Backend garante slug único (sufixo automático); front só exibe mensagem de erro se a API devolver conflito.

---

## Fase 4 — Preview (registry, sem executar código do banco)

### 4.1 PreviewContainer

- Manter o container de preview que já existe no layout (mesmo fundo/estilo).
- Preview = render real dentro do app (sem iframe).

### 4.2 Registry de preview

- Mapa interno (ex.: objeto ou Map) slug → componente React conhecido.
  - Ex.: `button` → `<Button {...previewProps}>{previewChildren}</Button>`.
- Só componentes registrados são renderizados; “código” do banco é só snippet/documentação, nunca executado.

### 4.3 Dados do preview

- Por variável: `previewProps` (JSON) e `previewChildren` (string opcional).
- Se `previewProps` não for JSON válido: não quebrar; mostrar aviso discreto dentro do PreviewContainer e manter layout.

### 4.4 Cadastro de novos componentes no registry

- Ao criar um novo tipo de componente no sistema (ex.: “Card”), adicionar entrada no registry no código (não vem do banco).

---

## Fase 5 — Changelog

### 5.1 Uma rota, estado vazio incluído

- **Só** `/changelog`. Conteúdo da página:
  - Se houver logs no período → lista de cards (preview + snippet + “Autor - HH:MM - DD/MM/AAAA” + link “Ver componente” para `/components/:slug` ou `#variant`).
  - Se não houver → estado vazio na mesma rota (ícone + “Sem logs no período” + mensagem).
- Filtros (Ontem, 7 dias, 15 dias, data): enviar parâmetros à API e refletir na lista.

### 5.2 Quando cria log

- Apenas quando “Salvar Componente” grava mudança real (backend compara payload ou hash).
- “Salvar sem alteração” não gera SaveEvent nem ChangelogEntry.

### 5.3 Conteúdo do card

- Preview (igual padrão atual), trecho de código, metadado do changelog, link para o componente (e opcionalmente âncora da variável).

---

## Fase 6 — Comentários e Inbox

### 6.1 Comentários por variável

- Comentários só para logado; sempre vinculados a uma variante.
- Na página do componente (`/components/:slug`): em cada seção de variável, área de comentários (timeline) e “Adicionar comentário”.
- Limite de texto: 800.
- API: criar/listar por variantId.

### 6.2 Inbox (`/inbox`)

- Só logado. Lista comentários recentes (com filtros existentes no layout); cada item leva ao componente/variação e permite responder.
- Não implementar: inbox público, notificações push/email, menções avançadas.

---

## Fase 7 — Usuários (Admin)

### 7.1 Rota e visibilidade

- `/usuarios` só visível para Admin (link no menu só para esse role).
- CRUD de usuários e roles (conforme API); manter layout atual da tela (tabela, modais de novo/editar/excluir/ver).

### 7.2 Integração

- Listar usuários da API; criar/editar/excluir via API; roles conforme spec (Admin, Designer, Dev).

---

## Fase 8 — Docs e Figma

### 8.1 Docs

- `/docs` (logado) e `/docs-public` (público): manter layout; se houver conteúdo dinâmico (ex.: lista de componentes ou páginas), alimentar pela API; caso contrário, manter estático.

### 8.2 Figma

- Item de menu “Figma”: link externo em nova aba (não é rota interna).

---

## Fase 9 — Validações e limites (front + backend)

- Aplicar limites da spec nos formulários e na API:
  - Nome componente: 1–60
  - Descrição componente: até 600
  - ImportDescription: até 1200
  - Nome variável: 1–40
  - Descrição variável: até 300
  - Comentário: até 800
  - Snippets/códigos: sem limite
- Campos com `*` obrigatórios bloqueiam Salvar se vazios.

---

## Fase 10 — Polimento e checklist “não inventar”

- **Tipografia:** Garantir que apenas Open Sans seja usada no produto final (remover Roboto Flex onde for referência de “design final”).
- **ROTAS.md:** Versão final com todas as rotas oficiais, redirects e “Design: Open Sans”.
- **Revisão:** Nenhuma nova página além da spec; nenhum fluxo de aprovação; nenhum comentário público; preview só via registry; nenhuma alteração de layout/estrutura visual.

---

## Ordem sugerida de execução (resumo)

1. **Fase 0** — Env, ROTAS.md, backend pronto (ou contrato da API).
2. **Fase 1** — Auth, contexto de usuário/role, redirects `/` e `/button`.
3. **Fase 2** — Rotas `/components/:slug` e `/:slug-public`, dados da API, lista na sidebar.
4. **Fase 3** — Novo componente e Editar componente conectados à API e permissões por role.
5. **Fase 4** — Registry de preview e validação de previewProps/previewChildren.
6. **Fase 5** — Changelog em uma rota com estado vazio.
7. **Fase 6** — Comentários por variável e Inbox.
8. **Fase 7** — CRUD de usuários (Admin).
9. **Fase 8** — Docs e Figma (links/comportamento).
10. **Fase 9 e 10** — Validações, limites e revisão final.

---

## Observações

- **Layout:** Em todas as fases, telas e componentes visuais permanecem como estão; apenas dados, rotas, permissões e conectores são implementados.
- **Render + Vercel:** Configurar `VITE_API_URL` no Vercel para a API no Render; CORS no Render liberado para o domínio do front.
- **Backlog permitido (não nesta entrega):** Drag-and-drop de variáveis (ícone pode ficar; ordem = ordem de criação).

Se quiser, o próximo passo prático é começar pela **Fase 0** (ROTAS.md + env) e **Fase 1** (auth e redirects), sem tocar em layout.
