# Rotas da Aplicação Belier

Este arquivo é a **fonte de verdade** das rotas do produto.  
O layout (cores, gradiente, sidebar, top bar, cards, tabs etc.) é **fixo** – aqui só definimos **para onde cada rota aponta**.

---

## 1. Rotas oficiais de produto

### 1.1 Componentes (interno e público)

- **Interno (logado):**  
  - **Rota base:** `/components/:slug`  
  - **Exemplo:** `/components/button`  
  - **Tela:** documentação do componente (tela atual de Button), com:
    - Seção **Import** (descrição + snippets Individual/Global)
    - Seções de variáveis (Default, Disabled, Sizes, Icon etc.)
    - Preview real do componente dentro do app
    - Código de cada variação
    - Comentários por variação (somente usuário logado)

- **Público:**  
  - **Rota base:** `/components/:slug-public`  
  - **Exemplo:** `/components/button-public`  
  - **Tela:** mesma estrutura visual da versão interna, **sem comentários nem ações internas**.

### 1.2 Docs

- **Interno:**  
  - **Rota:** `/docs`  
  - Página de documentação/guia interna.

- **Público:**  
  - **Rota:** `/docs-public`  
  - Versão pública da documentação, sem áreas que exigem login.

### 1.3 Criação e edição de componentes

- **Novo Componente:**  
  - **Rota:** `/novo-componente`  
  - **Arquivo de layout:** `Pagina-7-6659.tsx`  
  - Formulário com:
    - Informações básicas (Nome do componente, Descrição)
    - Seção Import (descrição + snippets Individual/Global)
    - Seção Variáveis do componente (Default + variáveis adicionais)
    - Botões **Cancelar** e **Salvar Componente**
    - Sidebar direita: Novo Componente, Informações básicas, Import, Variáveis do componente

- **Editar Componente:**  
  - **Rota oficial:** `/editar-componente/:componentId`  
  - (Rota sem `:componentId` pode existir como legado, mas o padrão do produto é com ID/slug.)  
  - Mesmo layout de edição existente, carregando dados reais do componente.

### 1.4 Inbox (comentários agregados)

- **Rota:** `/inbox`  
- **Acesso:** somente usuário logado.  
- Tela com lista agregada de comentários recentes (por período/filtros), permitindo ir para o componente/variação correspondente.

### 1.5 Changelog

- **Rota única:** `/changelog`  
- **Arquivo de layout:** `Pagina-7-8351.tsx`  
- Comportamento:
  - Quando **há logs** no período: lista de cards com preview, snippet, autor/hora/data e link **“Ver componente”**.
  - Quando **não há logs**: mostrar **estado vazio na mesma rota**, usando o layout da tela de Changelog vazio.
- A rota `/changelog-empty` pode existir apenas como **rota interna de teste**, **sem link no menu**.

### 1.6 Usuários (Admin)

- **Rota:** `/usuarios`  
- **Acesso:** apenas **Admin**.  
- Tela de gestão de usuários (lista + modais de novo/editar/excluir/ver).

### 1.7 Login

- **Rota:** `/login`  
- Tela de login atual, ligada ao backend para autenticação.

---

## 2. Compatibilidade e rotas legadas

Algumas rotas antigas precisam continuar existindo, mas hoje funcionam como **atalhos/redirects**:

- `/`  
  - Se **logado**: redirecionar para `/components/button`.  
  - Se **não logado**: redirecionar para `/components/button-public` (ou outra rota pública definida no backend).

- `/button`  
  - Mesmo comportamento de `/`: alias legado que leva para `/components/button` (logado) ou `/components/button-public` (público).

- `/button-public`  
  - Alias legado para `/components/button-public`.

Esses redirects são apenas lógicos (no código de rotas), **sem mudança de layout**.

---

## 3. Como adicionar novas páginas

No produto, **não criamos novas páginas além das listadas acima**, exceto aliases/redirects.  
Se for necessário importar outro frame do Figma para testes internos, seguir o padrão abaixo:

1. **Importar o frame do Figma** – os arquivos aparecem em `/src/imports/`.
2. **Criar uma página de wrapper** em `/src/app/pages/NomeDaPagina.tsx`:

```tsx
// /src/app/pages/MinhaNovaPage.tsx
import Pagina from "../../imports/Pagina-X-XXXX";

export default function MinhaNovaPage() {
  return <Pagina />;
}
```

3. **Adicionar a rota** em `/src/app/routes.tsx` (sem quebrar as rotas oficiais de produto).
4. **Documentar aqui** somente se for rota real de produto; rotas internas de teste não precisam aparecer como página oficial.

---

## 4. Navegação e estrutura visual

Todas as páginas compartilham a mesma estrutura visual (já implementada nos imports do Figma):

- **Sidebar esquerda:** Logo Belier + Menu (Inbox, Docs, Figma, ChangeLog, Componentes).
- **Top bar:** Menu horizontal + Campo de busca + Perfil (FK).
- **Gradiente holográfico:** fundo azul/laranja que cobre toda a tela.
- **Sidebar direita:** navegação de conteúdo (varia por página).
- **Figma:** item de menu que abre link externo do Figma em **nova aba** (não é rota interna).

O código que injeta navegação (Logged/Public/Login Navigation Injectors) deve apenas **conectar cliques às rotas acima**, sem alterar a aparência.

---

## 5. Design

- **Cores principais:** `#22272a` (fundo), `#16a6df` (azul Belier), `#bf340f` (botão laranja).
- **Fonte do produto:** **Open Sans** (os textos do produto final devem usar Open Sans).
- **Framework:** React + Tailwind CSS.
- **Roteamento:** React Router v7.

O layout vem dos frames do Figma e deve permanecer **idêntico**; as implementações só podem conectar dados, validações, preview, comentários, changelog e permissões por rota/usuário.
