
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
       VITE_API_URL=https://belier-system.onrender.com/api
       ```

     - On Vercel, set the same `VITE_API_URL` (`https://belier-system.onrender.com/api`) in the project environment variables.

  3. Start the development server:

     ```bash
     npm run dev
     ```

  The frontend runs with Vite + React, and will use `VITE_API_URL` to talk to the backend API hosted on Render.