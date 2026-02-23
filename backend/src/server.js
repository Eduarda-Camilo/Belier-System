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

// Contadores para IDs únicos (em memória)
let nextComponentId = 2;
let nextVariantId = 3;

// --- Helpers ---

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "component";
}

function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let suffix = 1;
  while (components.some((c) => c.slug === slug)) {
    slug = `${baseSlug}-${++suffix}`;
  }
  return slug;
}

function validateComponent(body) {
  const err = [];
  const name = (body.name || "").trim();
  if (!name || name.length < 1 || name.length > 60) err.push("Nome deve ter entre 1 e 60 caracteres");
  const desc = (body.description || "").trim();
  if (desc.length > 600) err.push("Descrição deve ter no máximo 600 caracteres");
  const importDesc = (body.importDescription || "").trim();
  if (importDesc.length > 1200) err.push("Import description deve ter no máximo 1200 caracteres");
  return { err, name, desc, importDesc };
}

function validateVariant(v, i) {
  const err = [];
  const title = (v.title || "").trim();
  if (!title || title.length < 1 || title.length > 40) err.push(`Variante ${i}: título deve ter entre 1 e 40 caracteres`);
  const desc = (v.description || "").trim();
  if (desc.length > 300) err.push(`Variante ${i}: descrição deve ter no máximo 300 caracteres`);
  return { err, title, desc };
}

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

// Detalhe de componente por slug ou id (inclui variáveis)
app.get("/api/components/:slug", (req, res) => {
  const { slug } = req.params;
  const component =
    components.find((c) => c.slug === slug) || components.find((c) => c.id === slug);

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

// Criar componente + variantes
app.post("/api/components", (req, res) => {
  const body = req.body || {};
  const { err, name, desc, importDesc } = validateComponent(body);
  if (err.length) return res.status(400).json({ error: err.join("; ") });

  let variantsPayload = Array.isArray(body.variants) ? body.variants : [];
  if (variantsPayload.length === 0) {
    variantsPayload = [{ title: "Default", description: "Variante padrão.", codeSnippet: "", previewProps: "{}", previewChildren: "" }];
  }
  const hasDefault = variantsPayload.some((v) => (v.title || "").trim().toLowerCase() === "default");
  if (!hasDefault) {
    return res.status(400).json({ error: "É obrigatório ter uma variante 'Default'" });
  }

  const variantErrors = [];
  const validatedVariants = variantsPayload.map((v, i) => {
    const { err: ve, title, desc: vdesc } = validateVariant(v, i + 1);
    variantErrors.push(...ve);
    return { title, desc: vdesc, codeSnippet: v.codeSnippet || "", previewProps: v.previewProps || "{}", previewChildren: v.previewChildren || "" };
  });
  if (variantErrors.length) return res.status(400).json({ error: variantErrors.join("; ") });

  const baseSlug = slugify(name);
  const slug = ensureUniqueSlug(baseSlug);
  const id = String(nextComponentId++);
  const now = new Date().toISOString();
  const userId = body.createdBy || "1";

  const component = {
    id,
    name,
    slug,
    description: desc,
    importDescription: body.importDescription || "",
    importSnippetIndividual: body.importSnippetIndividual || "",
    importSnippetGlobal: body.importSnippetGlobal || "",
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  };
  components.push(component);

  validatedVariants.forEach((v, i) => {
    const vid = `v${nextVariantId++}`;
    variants.push({
      id: vid,
      componentId: id,
      title: v.title,
      description: v.desc,
      codeSnippet: v.codeSnippet,
      previewProps: typeof v.previewProps === "string" ? v.previewProps : JSON.stringify(v.previewProps || {}),
      previewChildren: v.previewChildren,
      orderIndex: i,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId,
    });
  });

  const componentVariants = variants
    .filter((v) => v.componentId === id)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  createChangelogForSave(id, componentVariants, userId);

  res.status(201).json({ ...component, variants: componentVariants });
});

// Atualizar componente + variantes
app.put("/api/components/:id", (req, res) => {
  const { id } = req.params;
  const component = components.find((c) => c.id === id);
  if (!component) return res.status(404).json({ error: "Componente não encontrado" });

  const body = req.body || {};
  const { err, name, desc, importDesc } = validateComponent(body);
  if (err.length) return res.status(400).json({ error: err.join("; ") });

  const variantsPayload = Array.isArray(body.variants) ? body.variants : [];
  const hasDefault = variantsPayload.some((v) => (v.title || "").trim().toLowerCase() === "default");
  if (variantsPayload.length > 0 && !hasDefault) {
    return res.status(400).json({ error: "É obrigatório ter uma variante 'Default'" });
  }

  const variantErrors = [];
  const validatedVariants = variantsPayload.map((v, i) => {
    const { err: ve, title, desc: vdesc } = validateVariant(v, i + 1);
    variantErrors.push(...ve);
    return {
      id: v.id,
      title,
      desc: vdesc,
      codeSnippet: v.codeSnippet || "",
      previewProps: v.previewProps || "{}",
      previewChildren: v.previewChildren || "",
    };
  });
  if (variantErrors.length) return res.status(400).json({ error: variantErrors.join("; ") });

  const newSlug = slugify(name);
  const slug = newSlug === component.slug ? component.slug : ensureUniqueSlug(newSlug);

  const now = new Date().toISOString();
  const userId = body.updatedBy || "1";

  Object.assign(component, {
    name,
    slug,
    description: desc,
    importDescription: body.importDescription ?? component.importDescription,
    importSnippetIndividual: body.importSnippetIndividual ?? component.importSnippetIndividual,
    importSnippetGlobal: body.importSnippetGlobal ?? component.importSnippetGlobal,
    updatedAt: now,
    updatedBy: userId,
  });

  // Atualizar variantes existentes e criar novas
  const existingIds = new Set();
  validatedVariants.forEach((v, i) => {
    if (v.id) {
      const existing = variants.find((x) => x.id === v.id && x.componentId === id);
      if (existing) {
        existingIds.add(v.id);
        existing.title = v.title;
        existing.description = v.desc;
        existing.codeSnippet = v.codeSnippet;
        existing.previewProps = typeof v.previewProps === "string" ? v.previewProps : JSON.stringify(v.previewProps || {});
        existing.previewChildren = v.previewChildren;
        existing.orderIndex = i;
        existing.updatedAt = now;
        existing.updatedBy = userId;
      }
    }
  });

  // Remover variantes que não vieram no payload
  for (let i = variants.length - 1; i >= 0; i--) {
    if (variants[i].componentId === id && !existingIds.has(variants[i].id)) {
      variants.splice(i, 1);
    }
  }

  // Adicionar novas variantes (sem id no payload)
  validatedVariants.forEach((v, i) => {
    if (!v.id || !existingIds.has(v.id)) {
      const vid = `v${nextVariantId++}`;
      variants.push({
        id: vid,
        componentId: id,
        title: v.title,
        description: v.desc,
        codeSnippet: v.codeSnippet,
        previewProps: typeof v.previewProps === "string" ? v.previewProps : JSON.stringify(v.previewProps || {}),
        previewChildren: v.previewChildren,
        orderIndex: i,
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId,
      });
    }
  });

  const componentVariants = variants
    .filter((v) => v.componentId === id)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  createChangelogForSave(id, componentVariants, userId);

  res.json({ ...component, variants: componentVariants });
});

// Excluir componente
app.delete("/api/components/:id", (req, res) => {
  const { id } = req.params;
  const idx = components.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Componente não encontrado" });

  components.splice(idx, 1);
  for (let i = variants.length - 1; i >= 0; i--) {
    if (variants[i].componentId === id) variants.splice(i, 1);
  }

  res.status(204).send();
});

// ========== Área 2: Comentários por variante ==========

const comments = [];
let nextCommentId = 1;

function validateComment(text) {
  const t = (text || "").trim();
  if (!t) return { err: "Comentário não pode ser vazio" };
  if (t.length > 800) return { err: "Comentário deve ter no máximo 800 caracteres" };
  return { err: null, text: t };
}

app.get("/api/variants/:variantId/comments", (req, res) => {
  const { variantId } = req.params;
  const variant = variants.find((v) => v.id === variantId);
  if (!variant) return res.status(404).json({ error: "Variante não encontrada" });

  const list = comments
    .filter((c) => c.variantId === variantId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  res.json(list);
});

app.post("/api/variants/:variantId/comments", (req, res) => {
  const { variantId } = req.params;
  const variant = variants.find((v) => v.id === variantId);
  if (!variant) return res.status(404).json({ error: "Variante não encontrada" });

  const { text } = req.body || {};
  const { err, text: validText } = validateComment(text);
  if (err) return res.status(400).json({ error: err });

  const userId = req.body.authorId || "1";
  const now = new Date().toISOString();
  const comment = {
    id: String(nextCommentId++),
    variantId,
    authorId: userId,
    text: validText,
    createdAt: now,
  };
  comments.push(comment);
  res.status(201).json(comment);
});

// ========== Área 3: Changelog (SaveEvent, ChangelogEntry) ==========

const saveEvents = [];
const changelogEntries = [];
let nextSaveEventId = 1;
let nextChangelogEntryId = 1;

function createChangelogForSave(componentId, componentVariants, userId) {
  const component = components.find((c) => c.id === componentId);
  if (!component) return;

  const now = new Date().toISOString();
  const eventId = String(nextSaveEventId++);
  saveEvents.push({
    id: eventId,
    componentId,
    authorId: userId,
    createdAt: now,
  });

  componentVariants.forEach((v) => {
    changelogEntries.push({
      id: String(nextChangelogEntryId++),
      saveEventId: eventId,
      componentId,
      variantId: v.id,
      variantTitle: v.title,
      codeSnippet: v.codeSnippet,
      previewProps: v.previewProps,
      previewChildren: v.previewChildren,
      authorId: userId,
      createdAt: now,
    });
  });
}

app.get("/api/changelog", (req, res) => {
  const { period, from, to } = req.query;
  let fromDate;
  let toDate = new Date();

  if (from && to) {
    fromDate = new Date(from);
    toDate = new Date(to);
  } else if (period === "yesterday" || period === "1") {
    toDate = new Date();
    fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - 1);
    fromDate.setHours(0, 0, 0, 0);
  } else if (period === "7" || period === "7d") {
    fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - 7);
  } else if (period === "15" || period === "15d") {
    fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - 15);
  } else {
    fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - 30);
  }

  const fromTime = fromDate.getTime();
  const toTime = toDate.getTime();

  const entries = changelogEntries.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= fromTime && t <= toTime;
  });

  const withEvent = entries.map((e) => {
    const ev = saveEvents.find((s) => s.id === e.saveEventId);
    const comp = components.find((c) => c.id === e.componentId);
    return {
      ...e,
      componentName: comp?.name,
      componentSlug: comp?.slug,
      authorId: ev?.authorId,
      createdAt: e.createdAt,
    };
  });

  res.json(withEvent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// ========== Área 4: CRUD de usuários ==========

let nextUserId = 2;

function validateUser(body, isNew) {
  const err = [];
  const name = (body.name || "").trim();
  if (!name || name.length < 1) err.push("Nome é obrigatório");
  const email = (body.email || "").trim().toLowerCase();
  if (!email) err.push("Email é obrigatório");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.push("Email inválido");
  else if (isNew && users.some((u) => u.email === email)) err.push("Email já cadastrado");
  if (isNew) {
    const pwd = body.password || "";
    if (!pwd || pwd.length < 6) err.push("Senha deve ter no mínimo 6 caracteres");
  }
  return { err, name, email };
}

app.get("/api/users", (req, res) => {
  const list = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));
  res.json(list);
});

app.post("/api/users", (req, res) => {
  const body = req.body || {};
  const { err, name, email } = validateUser(body, true);
  if (err.length) return res.status(400).json({ error: err.join("; ") });

  const role = ["admin", "designer", "dev"].includes(body.role) ? body.role : "dev";
  const id = String(nextUserId++);
  const user = {
    id,
    name,
    email,
    password: body.password,
    role,
  };
  users.push(user);
  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const body = req.body || {};
  const { err, name, email } = validateUser({ ...body, email: body.email || user.email }, false);
  if (err.length) return res.status(400).json({ error: err.join("; ") });

  const otherWithEmail = users.find((u) => u.id !== id && u.email === email);
  if (otherWithEmail) return res.status(400).json({ error: "Email já cadastrado" });

  user.name = name;
  user.email = email;
  if (body.password && body.password.length >= 6) user.password = body.password;
  if (["admin", "designer", "dev"].includes(body.role)) user.role = body.role;

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  if (id === "1") return res.status(400).json({ error: "Não é possível excluir o usuário admin principal" });

  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "Usuário não encontrado" });

  users.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Belier backend dev rodando em http://localhost:${PORT}`);
});

