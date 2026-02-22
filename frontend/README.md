# Belier-System — Frontend

Aplicação React (Vite) para gerenciamento e documentação de componentes (Design System). MVP com tema em CSS variables para facilitar troca de layout depois (ex.: baseado no Figma).

## Estrutura

- `src/components/` — Layout (header, menu, conteúdo)
- `src/pages/` — Login, Register, ComponentDetail, ComponentForm, Notifications, UserList, Docs, ChangeLog
- `src/services/api.js` — cliente axios com token JWT
- `src/contexts/AuthContext.jsx` — usuário logado e login/logout
- `src/styles/theme.css` — variáveis de tema (cores, espaçamentos); altere aqui ao aplicar novo layout
- `src/styles/global.css` — estilos globais

## Como rodar

O backend deve estar rodando em `http://localhost:3001`. O Vite está configurado com proxy: requisições para `/api` são encaminhadas para o backend.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Login padrão (após rodar o seed no backend): **admin@belier.com** / **admin123**.

## Trocar o layout depois

Altere as variáveis em `src/styles/theme.css` e os arquivos em `src/components/` e `src/pages/*.css` conforme seu design no Figma. A lógica (rotas, API, formulários) permanece a mesma.
