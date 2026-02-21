# Como deixar o Belier-System público (hospedagem)

Assim você não precisa rodar backend e frontend no seu PC: o site fica no ar 24h (em serviços gratuitos o backend pode “dormir” após um tempo sem uso e acordar na primeira requisição).

Recomendação: **Render.com** (tem plano gratuito para backend + banco PostgreSQL + site estático).

---

## Visão geral

1. **Backend (Node/Express)** → hospedado como “Web Service” no Render.  
2. **Banco de dados** → PostgreSQL no Render (o SQLite não é persistido em servidores gratuitos).  
3. **Frontend (React)** → hospedado como “Static Site” no Render.

O projeto já está preparado: o backend usa `DATABASE_URL` para PostgreSQL em produção e o frontend usa `VITE_API_URL` para apontar para a sua API.

---

## Passo a passo no Render

### 1. Conta e repositório

- Crie uma conta em [render.com](https://render.com) (pode usar GitHub).
- Suba o projeto para um repositório no **GitHub** (se ainda não tiver). O Render faz deploy a partir do GitHub.

### 2. Banco PostgreSQL

1. No painel do Render: **New** → **PostgreSQL**.  
2. Dê um nome (ex.: `belier-db`), região próxima a você, plano **Free**.  
3. Depois de criar, anote a **Internal Database URL** (ou **External** se for usar de fora do Render). Você vai usar como `DATABASE_URL`.

### 3. Backend (Web Service)

1. **New** → **Web Service**.  
2. Conecte o repositório do GitHub e escolha o repositório do Belier-System.  
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Instance Type:** Free

4. Em **Environment** (variáveis de ambiente), adicione:

   | Key             | Value                                      |
   |-----------------|--------------------------------------------|
   | `DATABASE_URL`  | (cole a URL do PostgreSQL do passo 2)     |
   | `JWT_SECRET`    | uma string longa e aleatória (ex.: 32+ caracteres) |
   | `NODE_ENV`      | `production`                               |

5. Crie o Web Service. O Render vai fazer o deploy e dar uma URL, por exemplo:  
   `https://belier-system-api.onrender.com`

6. **Criar o usuário admin no banco:** depois do primeiro deploy, na aba **Shell** do seu Web Service (ou no deploy log), você pode rodar o seed. No Render não há “Shell” permanente como no seu PC; então use uma das opções:
   - **Opção A:** Adicione temporariamente um script no backend que rode o seed na primeira subida (pode ser um endpoint protegido ou um script que roda no start uma vez).
   - **Opção B:** Conecte no PostgreSQL por um cliente (ex.: DBeaver, ou o psql) usando a **External Database URL** e insira um usuário manualmente com senha hasheada (bcrypt).
   - **Opção C (mais simples):** Crie um endpoint temporário no backend, por exemplo `POST /api/setup/seed`, que só funciona quando não existe nenhum usuário e cria o admin. Depois você chama esse endpoint uma vez (Postman ou navegador) e depois remove ou protege o endpoint.

Para não complicar demais, podemos adicionar no backend um script que rode `npm run seed` no **Start Command** apenas na primeira vez. Uma forma simples: **Start Command** = `npm run seed && npm run start` (o seed só cria usuário se a tabela estiver vazia). Assim, no primeiro deploy o admin é criado.

### 4. Seed no primeiro deploy (backend)

No Render, no Web Service do backend, defina:

**Start Command:**  
`npm run seed && node src/server.js`

Assim, sempre que o serviço subir, o seed roda (e só cria o admin se ainda não existir usuário). O usuário padrão fica: **admin@belier.com** / **admin123**. Troque a senha depois pelo próprio sistema (ou pelo reset-admin se tiver acesso ao projeto).

### 5. Frontend (Static Site)

1. **New** → **Static Site**.  
2. Conecte o mesmo repositório do GitHub.  
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Em **Environment**, adicione:

   | Key              | Value                                                    |
   |------------------|----------------------------------------------------------|
   | `VITE_API_URL`   | URL do seu backend (ex.: `https://belier-system-api.onrender.com/api`) |

   Importante: no Render, para Static Site, a variável precisa ter o prefixo que o Vite usa. Use exatamente `VITE_API_URL`. A URL deve ser a do backend **incluindo** `/api` no final (ex.: `https://seu-backend.onrender.com/api`).

5. Deploy. O Render vai dar uma URL para o site, ex.:  
   `https://belier-system.onrender.com`

### 6. Testar

- Acesse a URL do **Static Site** (frontend).  
- Faça login com **admin@belier.com** / **admin123** (se tiver usado o seed no start do backend).  
- Se tudo estiver certo, o site usa a API pública e você não precisa de localhost nem terminal.

---

## Observações

- **Plano gratuito do Render:** o Web Service “dorme” após ~15 min sem acesso. A primeira requisição depois disso pode demorar alguns segundos (cold start).  
- **Senha do admin:** depois do primeiro login, use a tela de usuários (como admin) para trocar a senha ou criar outros usuários.  
- **CORS:** o backend já usa `cors()` sem restrição de origem; em produção você pode restringir para a URL do seu frontend (ex.: `https://belier-system.onrender.com`) nas configurações do Express, se quiser mais segurança.

---

## Outras opções de hospedagem

- **Railway:** parecido com o Render; oferece PostgreSQL e deploy a partir do GitHub.  
- **Vercel (frontend) + Render/Railway (backend):** frontend no Vercel (ótimo para React), backend em um desses.  
- **Frontend no Netlify:** também aceita build estático; configure `VITE_API_URL` para a URL do seu backend.

Em todos os casos: backend com `DATABASE_URL` (PostgreSQL) e `JWT_SECRET`; frontend com `VITE_API_URL` apontando para a URL da API (ex.: `https://seu-backend.onrender.com/api`).
