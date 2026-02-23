## Belier System — Frontend

### Stack

- **Framework:** React 18 + Vite
- **Estilos:** Tailwind CSS + classes geradas do Figma
- **Roteamento:** React Router v7
- **Código principal:**
  - Entrada: `src/main.tsx`
  - App: `src/app/App.tsx`
  - Rotas: `src/app/routes.tsx`
  - Páginas: `src/app/pages/*`
  - Layouts Figma: `src/imports/*`

### Como rodar localmente

```bash
npm i
# garantir que .env.local existe na raiz com:
# VITE_API_URL=http://localhost:3000/api
npm run dev
```

O frontend usa a variável `VITE_API_URL` para chamar o backend:
- Em desenvolvimento: `http://localhost:3000/api`
- Em produção: URL do backend (ex.: `https://belier-system.onrender.com/api`)

### Deploy no Vercel (evitar erro 404 ao salvar componente/usuário)

1. No projeto do Vercel, vá em **Settings → Environment Variables**.
2. Crie a variável **`VITE_API_URL`** com o valor da URL do backend (ex.: `https://belier-system.onrender.com/api`).
3. Faça um **novo deploy** (Redeploy) para que o build use a variável. Sem isso, as chamadas de API vão para o próprio Vercel e retornam 404.

