# Escopo e domínio — Belier-System

Documento de definição do escopo e do domínio do sistema para o trabalho final CSI606.

---

## 1. Visão geral

O **Belier-System** é uma plataforma para gerenciamento e documentação de componentes de interface (Design System / Component Library). Objetivos principais:

- Organizar e padronizar componentes de UI
- Facilitar comunicação entre designers e desenvolvedores
- Documentação técnica e visual com exemplos de uso
- Histórico de versões e comentários por componente
- Controle de acesso por perfil (Administrador, Designer, Desenvolvedor)

---

## 2. Entidades do domínio

### 2.1 Usuário (User)

| Atributo    | Tipo     | Descrição                          |
|------------|----------|------------------------------------|
| id         | UUID/int | Identificador único                |
| name       | string   | Nome completo                      |
| email      | string   | E-mail (único, login)              |
| password   | string   | Senha (armazenada com hash)        |
| profile    | enum     | `admin` \| `designer` \| `developer` |
| createdAt  | datetime | Data de criação                    |
| updatedAt  | datetime | Data da última atualização         |

### 2.2 Categoria (Category)

| Atributo   | Tipo     | Descrição           |
|------------|----------|---------------------|
| id         | UUID/int | Identificador único |
| name       | string   | Nome da categoria   |
| description| string   | Descrição (opcional)|
| createdAt  | datetime | Data de criação     |
| updatedAt  | datetime | Data de atualização |

Agrupa componentes (ex.: Botões, Formulários, Navegação).

### 2.3 Componente (Component)

| Atributo     | Tipo     | Descrição                                      |
|--------------|----------|------------------------------------------------|
| id           | UUID/int | Identificador único                            |
| name         | string   | Nome do componente                             |
| description  | string   | Descrição / documentação                       |
| categoryId   | FK       | Referência à Categoria                         |
| responsibleId| FK       | Referência ao Usuário responsável (designer)   |
| status       | enum     | `draft` \| `published` \| `archived`           |
| documentation| text    | Documentação técnica, exemplos de uso          |
| variations   | JSON/text| Estados/variações (opcional)                    |
| createdAt    | datetime | Data de criação                                |
| updatedAt    | datetime | Data de atualização                            |

### 2.4 Versão (Version)

| Atributo   | Tipo     | Descrição                         |
|------------|----------|-----------------------------------|
| id         | UUID/int | Identificador único               |
| componentId| FK       | Referência ao Componente          |
| number     | int      | Número da versão (ex.: 1, 2, 3)   |
| description| string   | Descrição da alteração            |
| content    | JSON/text| Snapshot dos dados da versão      |
| createdAt  | datetime | Data da criação da versão         |

Registra o histórico de alterações do componente.

### 2.5 Comentário (Comment)

| Atributo   | Tipo     | Descrição            |
|------------|----------|----------------------|
| id         | UUID/int | Identificador único  |
| componentId| FK       | Referência ao Componente |
| userId     | FK       | Autor do comentário  |
| text       | text     | Conteúdo do comentário |
| createdAt  | datetime | Data de criação      |
| updatedAt  | datetime | Data de edição (se houver) |

### 2.6 Notificação (Notification)

| Atributo    | Tipo     | Descrição                          |
|-------------|----------|------------------------------------|
| id          | UUID/int | Identificador único                |
| userId      | FK       | Usuário que recebe (responsável)   |
| commentId   | FK       | Comentário que originou            |
| componentId | FK       | Componente relacionado             |
| read        | boolean  | Se já foi lida                     |
| createdAt   | datetime | Data de criação                    |

Criada quando um novo comentário é feito em um componente (para notificar o responsável).

---

## 3. Regras de negócio e permissões

### 3.1 Perfis

| Perfil       | Descrição resumida |
|--------------|--------------------|
| **admin**    | Acesso total: CRUD componentes, gerenciar usuários, publicar/arquivar |
| **designer** | Criar/editar componentes e documentação; recebe notificações de comentários; valida atualizações |
| **developer**| Apenas visualização e comentários; não edita nem exclui componentes |

### 3.2 Matriz de permissões (por recurso)

| Ação                    | Admin | Designer | Developer |
|-------------------------|-------|----------|-----------|
| Criar componente        | Sim   | Sim      | Não       |
| Editar componente       | Sim   | Sim      | Não       |
| Excluir componente      | Sim   | Não*     | Não       |
| Publicar/arquivar       | Sim   | Não*     | Não       |
| Ver componentes         | Sim   | Sim      | Sim       |
| Criar/editar categoria  | Sim   | Sim*     | Não       |
| Ver categorias          | Sim   | Sim      | Sim       |
| Comentar                | Sim   | Sim      | Sim       |
| Ver comentários         | Sim   | Sim      | Sim       |
| Ver notificações        | Sim   | Sim      | Sim       |
| Gerenciar usuários      | Sim   | Não      | Não       |

\* Pode ser refinado no escopo (ex.: designer pode arquivar seus próprios componentes).

### 3.3 Regras gerais

- **Login:** obrigatório para todas as ações; identificação por e-mail e senha.
- **Responsável do componente:** usuário (designer/admin) que criou ou foi atribuído; é notificado em novos comentários.
- **Status do componente:** rascunho (visível para quem pode editar), publicado (visível para todos autenticados), arquivado (oculto ou só leitura).
- **Versões:** criadas automaticamente ou ao publicar alteração; apenas leitura após criadas.

---

## 4. Requisitos funcionais (resumo)

| ID | Requisito |
|----|-----------|
| RF01 | CRUD de componentes (conforme permissões) |
| RF02 | Visualização interativa dos componentes (estados/variações) |
| RF03 | Documentação técnica e exemplos de uso por componente |
| RF04 | Classificação por categorias e filtros de busca |
| RF05 | Histórico de versões por componente |
| RF06 | Sistema de comentários por componente |
| RF07 | Notificações para o responsável em novos comentários |
| RF08 | Controle de acesso (admin, designer, developer) |
| RF09 | Gestão de usuários e permissões (admin) |
| RF10 | CRUD de categorias (admin/designer) |

---

## 5. Escopo fora do MVP (opcional)

- Edição/exclusão de comentários pelo autor
- Upload de imagens/arquivos nos componentes
- Busca avançada (tags, múltiplos filtros)
- Exportação de documentação (PDF/HTML)

---

*Documento de escopo — Belier-System — CSI606.*
