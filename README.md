<<<<<<< HEAD

  # Reproduzir tela exatamente / Belier System

  This is a code bundle for Reproduzir tela exatamente (Belier System).
  The original design is available at https://www.figma.com/design/CR7TzRR9Co6biKCes6GCyJ/Reproduzir-tela-exatamente.

  ## Running the code (local development)

  1. Install dependencies:

     ```bash
     npm i
     ```

  2. Configure the backend API URL (Render) via environment variable:

     - Create a `.env.local` file in the project root with:

       ```bash
       # Durante o desenvolvimento local, use o backend em Node dentro deste repo:
       VITE_API_URL=http://localhost:3000/api
       ```

     - Em produção (Vercel), você pode apontar `VITE_API_URL` para a API hospedada (Render ou outro serviço).

  3. Start the development server:

     ```bash
     # em um terminal, rodar o backend:
     cd backend
     npm install
     npm run dev

     # em outro terminal, rodar o frontend:
     npm run dev
     ```

  The frontend runs with Vite + React, and will use `VITE_API_URL` to talk to the backend API hosted on Render.
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> d7c25eb2e8c12c9b416af41e8095716270364d35
