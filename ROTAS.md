# Rotas da Aplicação Belier

## Páginas Disponíveis

### 1. **Button** (Documentação do Componente)
- **Rota:** `/` ou `/button`
- **Arquivo:** `Pagina-7-5044.tsx`
- **Conteúdo:**
  - Seção Import com exemplos de código
  - Seção Default com preview e código
  - Seção Disabled com preview e código
  - Seção Text com comentários
  - Seção Sizes com comentários
  - Seção Icon com comentários
  - Timeline de comentários (Bryan Edwards, Adicionar comentário, etc.)

### 2. **Novo Componente** (Formulário)
- **Rota:** `/novo-componente`
- **Arquivo:** `Pagina-7-6659.tsx`
- **Conteúdo:**
  - Formulário "Novo Componente"
  - Seção "Informações básicas" (Nome do componente, Descrição)
  - Seção "Import" com editor de código
  - Campos Individual e Global
  - Seção "Variáveis do componente" (Default, Variável do componente)
  - Botões "Cancelar" e "Salvar"
  - Sidebar direita com menu: Novo Componente, Informações básicas, Import, Variáveis do componente

### 3. **ChangeLog** (Com Conteúdo)
- **Rota:** `/changelog`
- **Arquivo:** `Pagina-7-8351.tsx`
- **Conteúdo:**
  - Título "ChangeLog" com descrição
  - Barra de busca com filtros (Ontem, 7 dias, 15 dias, dd/mm/aaaa)
  - Seção "Default" com preview e código do botão laranja
  - Seção "Disabled" com preview e código do botão laranja desabilitado
  - Link "Ver componente" em cada seção

### 4. **ChangeLog Vazio** (Estado Vazio)
- **Rota:** `/changelog-empty`
- **Arquivo:** `Pagina-7-8615.tsx`
- **Conteúdo:**
  - Título "ChangeLog" com descrição
  - Barra de busca com filtros (Ontem, 7 dias, 15 dias, dd/mm/aaaa)
  - Estado vazio: Ícone de lupa + "Sem logs no período"
  - Mensagem: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."

## Como Adicionar Novas Páginas

1. **Importe o frame do Figma** - os arquivos aparecem em `/src/imports/`
2. **Crie uma nova página** em `/src/app/pages/NomeDaPagina.tsx`
3. **Adicione a rota** em `/src/app/routes.tsx`
4. **Documente aqui** neste arquivo

Exemplo:
```tsx
// /src/app/pages/MinhaNovaPage.tsx
import Pagina from "../../imports/Pagina-X-XXXX";

export default function MinhaNovaPage() {
  return <Pagina />;
}
```

```tsx
// Adicionar em /src/app/routes.tsx
{
  path: "/minha-rota",
  Component: MinhaNovaPage,
}
```

## Navegação

Todas as páginas compartilham a mesma estrutura:
- **Sidebar esquerda:** Logo Belier + Menu (Inbox, Docs, Figma, ChangeLog, Componentes)
- **Top bar:** Menu horizontal + Campo de busca + Perfil (FK)
- **Gradiente holográfico:** Fundo azul/laranja que cobre toda a tela
- **Sidebar direita:** Navegação de conteúdo (varia por página)

## Design

- **Cores principais:** `#22272a` (fundo), `#16a6df` (azul Belier), `#bf340f` (botão laranja)
- **Fontes:** Roboto Flex, Open Sans
- **Framework:** React + Tailwind CSS
- **Roteamento:** React Router v7
