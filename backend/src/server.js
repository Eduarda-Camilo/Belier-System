const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, "belier.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite local.");
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'dev'
    )`);

    // Components table
    db.run(`CREATE TABLE IF NOT EXISTS components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      importDescription TEXT,
      importSnippetIndividual TEXT,
      importSnippetGlobal TEXT,
      createdAt TEXT,
      createdBy TEXT,
      updatedAt TEXT,
      updatedBy TEXT
    )`);

    // Variants table
    db.run(`CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY,
      componentId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      codeSnippet TEXT,
      previewProps TEXT,
      previewChildren TEXT,
      orderIndex INTEGER,
      createdAt TEXT,
      createdBy TEXT,
      updatedAt TEXT,
      updatedBy TEXT,
      FOREIGN KEY(componentId) REFERENCES components(id) ON DELETE CASCADE
    )`);

    // Comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variantId TEXT,
      authorId TEXT,
      text TEXT NOT NULL,
      createdAt TEXT,
      FOREIGN KEY(variantId) REFERENCES variants(id) ON DELETE CASCADE
    )`);

    // SaveEvents table
    db.run(`CREATE TABLE IF NOT EXISTS save_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      componentId INTEGER,
      authorId TEXT,
      createdAt TEXT,
      FOREIGN KEY(componentId) REFERENCES components(id) ON DELETE CASCADE
    )`);

    // ChangelogEntries table
    db.run(`CREATE TABLE IF NOT EXISTS changelog_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saveEventId INTEGER,
      componentId INTEGER,
      variantId TEXT,
      variantTitle TEXT,
      codeSnippet TEXT,
      previewProps TEXT,
      previewChildren TEXT,
      authorId TEXT,
      createdAt TEXT,
      FOREIGN KEY(saveEventId) REFERENCES save_events(id) ON DELETE CASCADE
    )`);

    // Insert mock admin user if not exists
    db.get("SELECT * FROM users WHERE email = ?", ["admin@belier.com"], (err, row) => {
      if (!row) {
        db.run(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          ["Admin", "admin@belier.com", "admin123", "admin"]
        );
      }
    });
  });
}

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

function ensureUniqueSlug(baseSlug, currentId = null) {
  return new Promise((resolve, reject) => {
    let slug = baseSlug;
    let suffix = 1;

    const check = (currentSlug) => {
      const query = currentId 
        ? "SELECT id FROM components WHERE slug = ? AND id != ?" 
        : "SELECT id FROM components WHERE slug = ?";
      const params = currentId ? [currentSlug, currentId] : [currentSlug];

      db.get(query, params, (err, row) => {
        if (err) return reject(err);
        if (row) {
          suffix++;
          check(`${baseSlug}-${suffix}`);
        } else {
          resolve(currentSlug);
        }
      });
    };
    check(slug);
  });
}

function generateVariantId() {
  return 'v' + Date.now() + Math.floor(Math.random() * 1000);
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

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// ========== Rotas Básicas ==========

app.get("/api", (req, res) => {
  res.json({ message: "Belier API rodando com SQLite" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email e senha são obrigatórios" });

  try {
    const user = await getAsync("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
    if (!user) return res.status(401).json({ error: "Email ou senha inválidos" });

    res.json({
      token: "dev-token-sqlite",
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ========== Área 1: Componentes e Variantes ==========

app.get("/api/components", async (req, res) => {
  try {
    const items = await allAsync("SELECT id, name, slug, description FROM components ORDER BY createdAt DESC");
    res.json(items.map(item => ({ ...item, id: String(item.id) })));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar componentes" });
  }
});

app.get("/api/components/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const component = await getAsync("SELECT * FROM components WHERE slug = ? OR id = ?", [slug, slug]);
    if (!component) return res.status(404).json({ error: "Componente não encontrado" });

    const variants = await allAsync("SELECT * FROM variants WHERE componentId = ? ORDER BY orderIndex ASC", [component.id]);
    res.json({
      ...component,
      id: String(component.id),
      variants: variants,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar detalhes do componente" });
  }
});

app.post("/api/components", async (req, res) => {
  const body = req.body || {};
  const { err, name, desc, importDesc } = validateComponent(body);
  if (err.length) return res.status(400).json({ error: err.join("; ") });

  let variantsPayload = Array.isArray(body.variants) ? body.variants : [];
  if (variantsPayload.length === 0) {
    variantsPayload = [{ title: "Default", description: "Variante padrão.", codeSnippet: "", previewProps: "{}", previewChildren: "" }];
  }
  const hasDefault = variantsPayload.some((v) => (v.title || "").trim().toLowerCase() === "default");
  if (!hasDefault) return res.status(400).json({ error: "É obrigatório ter uma variante 'Default'" });

  const variantErrors = [];
  const validatedVariants = variantsPayload.map((v, i) => {
    const { err: ve, title, desc: vdesc } = validateVariant(v, i + 1);
    variantErrors.push(...ve);
    return { title, desc: vdesc, codeSnippet: v.codeSnippet || "", previewProps: v.previewProps || "{}", previewChildren: v.previewChildren || "" };
  });
  if (variantErrors.length) return res.status(400).json({ error: variantErrors.join("; ") });

  try {
    const baseSlug = slugify(name);
    const slug = await ensureUniqueSlug(baseSlug);
    const now = new Date().toISOString();
    const userId = body.createdBy || "1";

    const compResult = await runAsync(
      `INSERT INTO components (name, slug, description, importDescription, importSnippetIndividual, importSnippetGlobal, createdAt, createdBy, updatedAt, updatedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, desc, body.importDescription || "", body.importSnippetIndividual || "", body.importSnippetGlobal || "", now, userId, now, userId]
    );

    const componentId = compResult.lastID;
    const variantsList = [];

    for (let i = 0; i < validatedVariants.length; i++) {
      const v = validatedVariants[i];
      const vid = generateVariantId();
      const previewProps = typeof v.previewProps === "string" ? v.previewProps : JSON.stringify(v.previewProps || {});
      
      await runAsync(
        `INSERT INTO variants (id, componentId, title, description, codeSnippet, previewProps, previewChildren, orderIndex, createdAt, createdBy, updatedAt, updatedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [vid, componentId, v.title, v.desc, v.codeSnippet, previewProps, v.previewChildren, i, now, userId, now, userId]
      );

      variantsList.push({ id: vid, componentId, title: v.title, description: v.desc, codeSnippet: v.codeSnippet, previewProps, previewChildren: v.previewChildren, orderIndex: i, createdAt: now, createdBy: userId, updatedAt: now, updatedBy: userId });
    }

    // Changelog
    const saveEventResult = await runAsync(`INSERT INTO save_events (componentId, authorId, createdAt) VALUES (?, ?, ?)`, [componentId, userId, now]);
    const eventId = saveEventResult.lastID;

    for (const v of variantsList) {
      await runAsync(
        `INSERT INTO changelog_entries (saveEventId, componentId, variantId, variantTitle, codeSnippet, previewProps, previewChildren, authorId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventId, componentId, v.id, v.title, v.codeSnippet, v.previewProps, v.previewChildren, userId, now]
      );
    }

    const newComp = await getAsync("SELECT * FROM components WHERE id = ?", [componentId]);
    res.status(201).json({ ...newComp, id: String(newComp.id), variants: variantsList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar componente" });
  }
});

app.put("/api/components/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  
  try {
    const component = await getAsync("SELECT * FROM components WHERE id = ?", [id]);
    if (!component) return res.status(404).json({ error: "Componente não encontrado" });

    const { err, name, desc, importDesc } = validateComponent(body);
    if (err.length) return res.status(400).json({ error: err.join("; ") });

    const variantsPayload = Array.isArray(body.variants) ? body.variants : [];
    const hasDefault = variantsPayload.some((v) => (v.title || "").trim().toLowerCase() === "default");
    if (variantsPayload.length > 0 && !hasDefault) return res.status(400).json({ error: "É obrigatório ter uma variante 'Default'" });

    const variantErrors = [];
    const validatedVariants = variantsPayload.map((v, i) => {
      const { err: ve, title, desc: vdesc } = validateVariant(v, i + 1);
      variantErrors.push(...ve);
      return { id: v.id, title, desc: vdesc, codeSnippet: v.codeSnippet || "", previewProps: v.previewProps || "{}", previewChildren: v.previewChildren || "" };
    });
    if (variantErrors.length) return res.status(400).json({ error: variantErrors.join("; ") });

    const baseSlug = slugify(name);
    const slug = await ensureUniqueSlug(baseSlug, id);
    const now = new Date().toISOString();
    const userId = body.updatedBy || "1";

    await runAsync(
      `UPDATE components SET name = ?, slug = ?, description = ?, importDescription = ?, importSnippetIndividual = ?, importSnippetGlobal = ?, updatedAt = ?, updatedBy = ? WHERE id = ?`,
      [name, slug, desc, body.importDescription ?? component.importDescription, body.importSnippetIndividual ?? component.importSnippetIndividual, body.importSnippetGlobal ?? component.importSnippetGlobal, now, userId, id]
    );

    // Get current variants to compute diffs
    const currentVariants = await allAsync("SELECT id FROM variants WHERE componentId = ?", [id]);
    const currentVariantIds = currentVariants.map(v => v.id);
    const keepingVariantIds = new Set(validatedVariants.filter(v => v.id).map(v => v.id));

    // Delete removed variants
    for (const cvId of currentVariantIds) {
      if (!keepingVariantIds.has(cvId)) {
        await runAsync("DELETE FROM variants WHERE id = ?", [cvId]);
      }
    }

    const variantsList = [];
    for (let i = 0; i < validatedVariants.length; i++) {
      const v = validatedVariants[i];
      const previewProps = typeof v.previewProps === "string" ? v.previewProps : JSON.stringify(v.previewProps || {});
      
      if (v.id && keepingVariantIds.has(v.id)) {
        await runAsync(
          `UPDATE variants SET title = ?, description = ?, codeSnippet = ?, previewProps = ?, previewChildren = ?, orderIndex = ?, updatedAt = ?, updatedBy = ? WHERE id = ?`,
          [v.title, v.desc, v.codeSnippet, previewProps, v.previewChildren, i, now, userId, v.id]
        );
        variantsList.push({ id: v.id, componentId: Number(id), title: v.title, description: v.desc, codeSnippet: v.codeSnippet, previewProps, previewChildren: v.previewChildren, orderIndex: i, updatedAt: now, updatedBy: userId });
      } else {
        const vid = generateVariantId();
        await runAsync(
          `INSERT INTO variants (id, componentId, title, description, codeSnippet, previewProps, previewChildren, orderIndex, createdAt, createdBy, updatedAt, updatedBy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [vid, id, v.title, v.desc, v.codeSnippet, previewProps, v.previewChildren, i, now, userId, now, userId]
        );
        variantsList.push({ id: vid, componentId: Number(id), title: v.title, description: v.desc, codeSnippet: v.codeSnippet, previewProps, previewChildren: v.previewChildren, orderIndex: i, createdAt: now, createdBy: userId, updatedAt: now, updatedBy: userId });
      }
    }

    // Create Changelog
    const saveEventResult = await runAsync(`INSERT INTO save_events (componentId, authorId, createdAt) VALUES (?, ?, ?)`, [id, userId, now]);
    const eventId = saveEventResult.lastID;

    for (const v of variantsList) {
      await runAsync(
        `INSERT INTO changelog_entries (saveEventId, componentId, variantId, variantTitle, codeSnippet, previewProps, previewChildren, authorId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventId, id, v.id, v.title, v.codeSnippet, v.previewProps, v.previewChildren, userId, now]
      );
    }

    const updatedComp = await getAsync("SELECT * FROM components WHERE id = ?", [id]);
    res.json({ ...updatedComp, id: String(updatedComp.id), variants: variantsList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar componente" });
  }
});

app.delete("/api/components/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const changes = (await runAsync("DELETE FROM components WHERE id = ?", [id])).changes;
    if (changes === 0) return res.status(404).json({ error: "Componente não encontrado" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir componente" });
  }
});

// ========== Área 2: Comentários ==========

function validateComment(text) {
  const t = (text || "").trim();
  if (!t) return { err: "Comentário não pode ser vazio" };
  if (t.length > 800) return { err: "Comentário deve ter no máximo 800 caracteres" };
  return { err: null, text: t };
}

app.get("/api/variants/:variantId/comments", async (req, res) => {
  const { variantId } = req.params;
  try {
    const list = await allAsync("SELECT * FROM comments WHERE variantId = ? ORDER BY createdAt ASC", [variantId]);
    res.json(list.map(c => ({ ...c, id: String(c.id) })));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
});

app.post("/api/variants/:variantId/comments", async (req, res) => {
  const { variantId } = req.params;
  const { text, authorId } = req.body || {};
  
  const { err, text: validText } = validateComment(text);
  if (err) return res.status(400).json({ error: err });

  try {
    const variant = await getAsync("SELECT id FROM variants WHERE id = ?", [variantId]);
    if (!variant) return res.status(404).json({ error: "Variante não encontrada" });

    const userId = authorId || "1";
    const now = new Date().toISOString();
    
    const result = await runAsync(
      `INSERT INTO comments (variantId, authorId, text, createdAt) VALUES (?, ?, ?, ?)`,
      [variantId, userId, validText, now]
    );

    res.status(201).json({ id: String(result.lastID), variantId, authorId: userId, text: validText, createdAt: now });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar comentário" });
  }
});

// ========== Área 3: Changelog ==========

app.get("/api/changelog", async (req, res) => {
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

  const fromISODate = fromDate.toISOString();
  const toISODate = toDate.toISOString();

  try {
    const query = `
      SELECT ch.*, c.name as componentName, c.slug as componentSlug 
      FROM changelog_entries ch
      JOIN components c ON ch.componentId = c.id
      WHERE ch.createdAt >= ? AND ch.createdAt <= ?
      ORDER BY ch.createdAt DESC
    `;
    const entries = await allAsync(query, [fromISODate, toISODate]);
    res.json(entries.map(e => ({ ...e, id: String(e.id), saveEventId: String(e.saveEventId), componentId: String(e.componentId) })));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar changelog" });
  }
});

// ========== Área 4: Usuários ==========

function validateUserForm(body, isNew) {
  return new Promise(async (resolve) => {
    const err = [];
    const name = (body.name || "").trim();
    if (!name || name.length < 1) err.push("Nome é obrigatório");
    
    const email = (body.email || "").trim().toLowerCase();
    if (!email) err.push("Email é obrigatório");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.push("Email inválido");
    else if (isNew) {
      const existing = await getAsync("SELECT id FROM users WHERE email = ?", [email]);
      if (existing) err.push("Email já cadastrado");
    }

    if (isNew) {
      const pwd = body.password || "";
      if (!pwd || pwd.length < 6) err.push("Senha deve ter no mínimo 6 caracteres");
    }
    
    resolve({ err, name, email });
  });
}

app.get("/api/users", async (req, res) => {
  try {
    const list = await allAsync("SELECT id, name, email, role FROM users");
    res.json(list.map(u => ({ ...u, id: String(u.id) })));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

app.post("/api/users", async (req, res) => {
  const body = req.body || {};
  try {
    const { err, name, email } = await validateUserForm(body, true);
    if (err.length) return res.status(400).json({ error: err.join("; ") });

    const role = ["admin", "designer", "dev"].includes(body.role) ? body.role : "dev";
    
    const result = await runAsync(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, body.password, role]
    );

    res.status(201).json({ id: String(result.lastID), name, email, role });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  
  try {
    const user = await getAsync("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const email = (body.email || user.email).trim().toLowerCase();
    const existing = await getAsync("SELECT id FROM users WHERE email = ? AND id != ?", [email, id]);
    if (existing) return res.status(400).json({ error: "Email já cadastrado" });

    const name = (body.name || user.name).trim();
    if (!name) return res.status(400).json({ error: "Nome é obrigatório" });
    
    const role = ["admin", "designer", "dev"].includes(body.role) ? body.role : user.role;
    const password = body.password && body.password.length >= 6 ? body.password : user.password;

    await runAsync(
      "UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?",
      [name, email, password, role, id]
    );

    res.json({ id: String(id), name, email, role });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await getAsync("SELECT email FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    
    if (user.email === "admin@belier.com") {
      return res.status(400).json({ error: "Não é possível excluir o usuário admin principal" });
    }

    await runAsync("DELETE FROM users WHERE id = ?", [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

app.listen(PORT, () => {
  console.log(`Belier backend rodando em porta ${PORT} com SQLite persistent`);
});
