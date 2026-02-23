const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: true, // permite qualquer origem em desenvolvimento
    credentials: true,
  })
);
app.use(express.json());

// Usuários em memória (apenas para desenvolvimento)
const users = [
  {
    id: "1",
    email: "admin@belier.com",
    password: "admin123",
    name: "Admin",
    role: "admin",
  },
];

app.get("/api", (req, res) => {
  res.json({ message: "Belier local API — dev only" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Email ou senha inválidos" });
  }

  // No futuro podemos gerar um token de verdade; por enquanto, é mock.
  res.json({
    token: "dev-token",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Belier backend dev rodando em http://localhost:${PORT}`);
});

