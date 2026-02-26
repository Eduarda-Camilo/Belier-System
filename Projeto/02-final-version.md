# **CSI606-2024-02 - Remoto - Trabalho Final - Resultados**

## *Discente: Eduarda Camilo*

---

### Resumo

O **Belier Sistema (BelierUI)** é uma plataforma premium voltada para a documentação técnica e o gerenciamento prático de componentes de interface de usuário (UI). Inspirado por design systems modernos e estéticas de "dark mode" luxuosas e brutais, o sistema oferece um hub unificado onde desenvolvedores podem visualizar, copiar códigos, criar novos componentes e registrar em um *changelog* todas as evoluções da biblioteca. A aplicação contempla todo o ciclo: desde a autenticação segura de usuários até a persistência dos códigos em banco de dados relacional.

---

### 1. Funcionalidades implementadas

- **Autenticação Segura:** Login e Cadastro de usuários utilizando Supabase Auth, protegendo rotas sensíveis da aplicação.
- **Gestão de Perfil e Acessos:** Exibição dinâmica de dados do usuário (nome, e-mail, iniciais) e controle de nível de acesso (Admin vs Usuário comum).
- **Documentação de Componentes (Visualização):** Páginas dinâmicas para visualizar componentes UI renderizados, com blocos de código integrados, formatação de sintaxe (*syntax highlighting*) e botão de cópia com um clique.
- **Criação e Edição de Componentes (Admin):** Área administrativa com editor de código online integrado (React Simple Code Editor + PrismJS) para criar e alterar atributos e códigos HTML/Tailwind dos componentes diretamente pela interface.
- **Sistema de ChangeLog:** Histórico automatizado de alterações. Toda vez que um componente é salvo ou editado, uma nova versão fica registrada para auditoria e acompanhamento de mudanças.
- **Widgets Utilitários (Global Right Panel):** Implementação de ferramentas nativas na interface, como Conversor de Cores Hex/RGB em tempo real, Bloco de Notas Rápidas integrado ao LocalStorage, e elementos de "Ambient Branding" focados em design de excelência.
- **Design System Premium:** Layout 100% responsivo, focado em dark mode profundo, sem componentes padronizados óbvios, focado em originalidade e experiência do usuário (UX).

---

### 2. Funcionalidades previstas e não implementadas

- **Colaboração em Tempo Real:** Permitir que múltiplos usuários editem o mesmo componente simultaneamente (tipo Google Docs).
- **Upload e Galeria de Imagens de Componente:** Hospedagem nativa de imagens anexadas aos componentes documentados pelo Supabase Storage (atualmente focado 100% em código fonte).
- **Exportação de Projetos:** Download do código de múltiplos componentes agrupados em formato .ZIP para integração offline.

---

### 3. Outras funcionalidades implementadas

- Controle Granular de Estado: Uso customizado da *Context API* para encapsular e rotear estados de sessão (AuthContext) por toda a aplicação.
- Componentes Dinâmicos por Banco de Dados: Toda a estrutura da "DocsPage" é alimentada reativamente pelo backend conforme edições são feitas.

---

### 4. Principais desafios e dificuldades

Durante o desenvolvimento do BelierUI, o maior desafio conceitual foi integrar um **Editor de Código (em tempo real)** funcional na versão WEB, mantendo o estrito nível estético desejado. Houve grande dificuldade na sincronização de estado (`initialCode` do editor sumindo ou falhando na persistência) durante a comunicação com o banco de dados.

Do ponto de vista de DevOps e infraestrutura, a implementação das **Políticas de RLS (Row Level Security) do Supabase** gerou dificuldades, exigindo múltiplas configurações de permissão SQL para que apenas administradores autenticados conseguissem alterar ou inserir logs na tabela `changelog`. 
Por fim, o ciclo de **Deploy contínuo no Vercel** trouxe problemas de concorrência com variáveis de ambiente (loops infinitos engatilhados por falhas de string no vite/build). A solução exigiu tratamentos sólidos de exceção (`try/catch`) no contexto de roteamento AuthContext da aplicação.

---

### 5. Instruções para instalação e execução

**Pré-requisitos:**
- Node.js (v18+) instalado na máquina.
- Gerenciador de pacotes npm.

**Passos para rodar localmente:**
1. Clone o repositório do github:
   ```bash
   git clone https://github.com/Eduarda-Camilo/Belier-System.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd Belier-System
   ```
3. Instale as dependências pelo terminal:
   ```bash
   npm install
   ```
4. Crie um arquivo chamado `.env` na raiz do projeto contendo as chaves de conexão do banco de dados fornecidas pelo administrador (necessário as diretivas VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Acesse a aplicação no seu navegador: `http://localhost:5173`.

> **Nota para Avaliação:** A aplicação já encontra-se implantada em produção e hospedada no Vercel. Caso prefira avaliar a versão online rodando em sua totalidade, acesse: [**https://belier-system.vercel.app**](https://belier-system.vercel.app).

---

### 6. Referências

- Documentação Oficial Vite: https://vite.dev/
- Documentação React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- Supabase (Backend as a Service): https://supabase.com/docs
- Vercel (Hospedagem): https://vercel.com/docs
