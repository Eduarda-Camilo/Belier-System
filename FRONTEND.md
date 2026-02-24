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
2. Crie (ou edite) a variável **`VITE_API_URL`** com a **base da API** (apenas até `/api`, **sem** endpoints como `/auth/login`):
   - **Correto:** `https://belier-system-1.onrender.com/api`
   - **Errado:** `https://belier-system-1.onrender.com/api/auth/login` (isso gera 404 em `/components`, `/users`, etc.)
3. Faça um **novo deploy** (Redeploy) para que o build use a variável.

