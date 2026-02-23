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
- Em produção (Vercel): `https://belier-system-1.onrender.com/api`

