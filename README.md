# **CSI606-2024-02 - Remoto - Trabalho Final - Resultados**

## *Discente: Eduarda Gomes Camilo*

---

### Resumo

O **Belier Sistema (BelierUI)** é uma plataforma desenvolvida para o gerenciamento e documentação de componentes de interface de usuário (UI). O objetivo do sistema é atuar como um *Design System* centralizado, permitindo que a equipe unifique os componentes visuais em um ambiente único, mantendo a padronização e a eficiência no processo de desenvolvimento web. A aplicação conta com visualização interativa dos elementos, documentação técnica e um histórico completo de alterações (changelog), garantindo a consistência das atualizações e facilitando a comunicação e clareza do time.

---

### 1. Funcionalidades implementadas

De acordo com o escopo inicial proposto, as seguintes funcionalidades foram implementadas com sucesso:

- **Controle de Acesso e Autenticação:** Implementação de um sistema seguro de Login e Cadastro de usuários, utilizando autenticação no backend (Supabase), permitindo distinguir fluxos entre Administradores e Desenvolvedores.
- **CRUD de Componentes:** Foi construído o gerenciamento completo para criação, leitura, atualização (edição) e deleção de dados referentes aos componentes e seus atributos.
- **Visualização Interativa e Documentação Técnica:** Página de componentes onde os usuários podem ver a interface de fato renderizada na tela juntamente com seu bloco de código correspondente, exemplos de uso e um botão prático para copiar o trecho completo de código.
- **Histórico de Versões (Changelog):** A plataforma conta com um sistema de registro histórico. Sempre que modificações ocorrem em um componente, novas "versões" são cadastradas, gerando um controle de evolução contínua da biblioteca.

---

### 2. Funcionalidades previstas e não implementadas

A proposta inicial previa uma plataforma altamente focada na colaboração textual entre equipes. Devido ao volume de requisições exigido e a desafios na priorização de escopo durante o desenvolvimento, as seguintes *features* foram planejadas para uma futura versão:

- **Sistema de Comentários em cada Componente:** A ideia original contemplava que os desenvolvedores pudessem interagir tirando dúvidas ou sugerindo melhorias como notas (threads) diretamente na página do componente, o que não foi incorporado.
- **Notificações para o Responsável:** Sendo dependente do sistema de comentários, os alertas diretos a *Desingers* quando novos desenvolvimentos solicitassem atenção não foram realizados na versão v1.0.
- **Classificação de Categorias por Filtro:** Enquanto temos uma barra de busca funcionando perfeitamente (para procurar pelo título do elemento, como "Button"), um sistema mais robusto e cruzado para filtrar visualmente os componentes por ramificações e *tags* muito extensas acabou não sendo incluído nesta entrega final.

---

### 3. Outras funcionalidades implementadas

Apesar de algumas baixas na parte social do sistema, compensamos o fluxo técnico com funcionalidades excedentes:

- **Widgets Utilitários Embutidos:** A fim de dar mais valor prático à ferramenta de Design System, foram adicionadas *features* menores, como o "Conversor Hexadecimal/RGB" real e um sistema "Notas Rápidas" integrado ao cache local (`LocalStorage`) do navegador, voltado a pequenos ensaios pontuais da parte do programador que estiver copiando um componente.
- **Micro-Editor de Cógido Embutido:** Como o administrador precisaria não apenas registrar o "nome" do texto, mas sim o seu comportamento em blocos de `HTML/JSX/Tailwind`, foi necessário embutir pela plataforma um editor com auto-detecção sintática (`react-simple-code-editor` e `prismjs`), gerando uma vivência mais realista na construção da própria documentação.
- **Banco de Dados Relacional Nativo e RLS:** Migrou-se para a ferramenta tecnológica em nuvem (BaaS - Supabase) por trazer regras inerentes nas políticas de acesso (`Row Level Security` via SQL), controlando quem pode atualizar dados dentro das próprias tabelas da aplicação, sem exigir um middleware Backend robusto tradicional montado do zero.

---

### 4. Principais desafios e dificuldades

Durante o processo de construção e desenvolvimento, três grandes gargalos proporcionaram expressivos percalços à finalização da plataforma:

1. A **Manipulação Textual Especial na View**: Integrar a visualização real do código dos usuários sem que a formatação local quebrasse todo o CSS externo e renderizar os blocos preenchidos de forma exata e síncrona representaram difíceis problemas lógicos com ferramentas e componentes nativos do React (o código apagava os atributos temporários sem envio à persistência).
2. O **Configurador de Tabelas Relacionais na Nuvem**: Escrever o código SQL puro direto para gerar dependência condicional (onde criar um componente força a criação inicial do *log*) revelou uma série de dificuldades imprevistas de infraestrutura.
3. Tratamento de **Deploy em Vercel**: A migração final entre a estrutura do modo "Desenvolvimento/Localhost" para uma ferramenta CI/CD online escancarou problemas cruciais com *Promises* pendentes. Especificamente o manuseio desprotegido de variáveis secretas (Chaves de API) entre Git e Hospedeiro travava as sessões de login assíncronas do React num `loop` de *loading*, demandando correções sensíveis à prova de exceção (`try/catch`).

---

### 5. Instruções para instalação e execução

**Pré-requisitos e Ambientação Opcional:**
- Utilização de Terminal Shell e Node.js (v18+) contendo gerenciador de pacotes npm.
- Conta local no Github ou Client (CLI) instalado.

**Passos para Execução Manual (Local):**
1. Realize o Clone do projeto via linha de comando ou baixe seus arquivos principais (*Download ZIP*).
   ```bash
   git clone https://github.com/Eduarda-Camilo/Belier-System.git
   cd Belier-System
   ```
2. Instale massivamente as pacotes inerentes na arquitetura do Framework via Node:
   ```bash
   npm install
   ```
3. Na pasta matriz da *stack* (`BelierUI`), configure o arquivo invisível nomeado `.env` portando os chaves de conexão providos (os *tokens* obrigatórios são: `VITE_SUPABASE_URL` assim como a chave pública em `VITE_SUPABASE_ANON_KEY`).
4. Inicialize propriamente os servidores locais:
   ```bash
   npm run dev
   ```

> **Aviso de Avaliação Prioritário:** O trabalho prático possui vínculo ativo (Continuous Deployment). É completamente possível julgar e avaliar o seu pleno desenvolvimento técnico pela plataforma externa já vinculada ao GitHub.
> Basta acessar o endereço web de produção: **https://belier-system.vercel.app**

---

### 6. Referências
---
