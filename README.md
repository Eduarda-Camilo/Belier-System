
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