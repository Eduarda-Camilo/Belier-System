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
- Em produção: URL do backend. Pode ser com ou sem `/api` no final (o client adiciona `/api` se faltar).

### Deploy no Vercel (evitar erro 404 ao salvar)

1. No projeto do Vercel, vá em **Settings → Environment Variables**.
2. Crie a variável **`VITE_API_URL`** com a URL do backend:
   - **Recomendado:** `https://belier-system-1.onrender.com/api`
   - **Também aceito:** `https://belier-system-1.onrender.com` (o app adiciona `/api` automaticamente)
   - **Evite:** incluir caminhos como `/auth/login` — use só a base.
3. Faça um **novo deploy** para o build usar a variável.
4. Confirme que o backend (ex.: Render) está no ar; se estiver “sleeping”, a primeira requisição pode falhar.

