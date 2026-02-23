## Belier System — Backend (API)

### Base URL

- Produção (Render):  
  `https://belier-system.onrender.com/api`

### Endpoints esperados (contrato para o frontend)

- **Auth**
  - `POST /auth/login` — autenticação de usuário (Admin/Designer/Dev).

- **Componentes**
  - `GET /components` — lista de componentes.
  - `GET /components/:slug` — detalhes de um componente (inclui variáveis).
  - `POST /components` — cria componente + variáveis (conforme permissões).
  - `PUT /components/:id` — atualiza componente + variáveis.
  - `DELETE /components/:id` — exclui componente (somente Admin/Designer).

- **Comentários**
  - `GET /variants/:variantId/comments`
  - `POST /variants/:variantId/comments`

- **Changelog**
  - `GET /changelog` — histórico por período (parâmetros de filtro).

- **Usuários**
  - `GET /users` — lista de usuários (Admin).
  - `POST /users`, `PUT /users/:id`, `DELETE /users/:id` — gestão de usuários.

> OBS: O código-fonte do backend fica em outro repositório/projeto.  
> Este arquivo documenta apenas **como o frontend conversa com a API**.

