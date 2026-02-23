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

// Componentes em memória (apenas para desenvolvimento)
const components = [
  {
    id: "1",
    name: "Button",
    slug: "button",
    description: "Botão padrão do sistema Belier.",
    importDescription:
      "Use o componente Button para ações principais. Ele suporta variações como Default, Disabled, Sizes e Icon.",
    importSnippetIndividual: `import { Button } from "@/components/ui/button";`,
    importSnippetGlobal: `// registre o Button no seu design system global`,
    createdAt: new Date().toISOString(),
    createdBy: "1",
    updatedAt: new Date().toISOString(),
    updatedBy: "1",
  },
];

const variants = [
  {
    id: "v1",
    componentId: "1",
    title: "Default",
    description: "Estado padrão do botão.",
    codeSnippet: `<Button>Salvar</Button>`,
    previewProps: JSON.stringify({ variant: "default" }),
    previewChildren: "Salvar",
    orderIndex: 0,
    createdAt: new Date().toISOString(),
    createdBy: "1",
    updatedAt: new Date().toISOString(),
    updatedBy: "1",
  },
  {
    id: "v2",
    componentId: "1",
    title: "Disabled",
    description: "Botão desabilitado.",
    codeSnippet: `<Button disabled>Salvar</Button>`,
    previewProps: JSON.stringify({ disabled: true }),
    previewChildren: "Salvar",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    createdBy: "1",
    updatedAt: new Date().toISOString(),
    updatedBy: "1",
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

// Lista de componentes
app.get("/api/components", (req, res) => {
  const items = components.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));
  res.json(items);
});

// Detalhe de componente por slug (inclui variáveis)
app.get("/api/components/:slug", (req, res) => {
  const { slug } = req.params;
  const component = components.find((c) => c.slug === slug);

  if (!component) {
    return res.status(404).json({ error: "Componente não encontrado" });
  }

  const componentVariants = variants
    .filter((v) => v.componentId === component.id)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  res.json({
    ...component,
    variants: componentVariants,
  });
});

app.listen(PORT, () => {
  console.log(`Belier backend dev rodando em http://localhost:${PORT}`);
});

