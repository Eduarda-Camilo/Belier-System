/**
 * Controller de Examples (Default + Variações de um componente).
 * - listByComponent: retorna default + variações ordenadas
 * - create: cria default ou variation (valida 1 default por componente)
 * - update: atualiza exemplo
 * - remove: remove exemplo (não permitir remover default se for o único)
 * - reorder: atualiza order das variações
 */

const { Example, Component } = require('../models');

async function listByComponent(req, res, next) {
  try {
    const { componentId } = req.params;
    const examples = await Example.findAll({
      where: { componentId },
      order: [
        ['type', 'ASC'],
        ['order', 'ASC'],
      ],
    });
    const defaultExample = examples.find((e) => e.type === 'default') || null;
    const variations = examples.filter((e) => e.type === 'variation');
    res.json({ default: defaultExample, variations });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { componentId } = req.params;
    const { type, title, slug, description, order, propsTokens, codeSnippet, codeCss, codeJs, codeCustom, renderConfig } = req.body;

    const component = await Component.findByPk(componentId);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }

    if (type === 'default') {
      const existing = await Example.findOne({ where: { componentId, type: 'default' } });
      if (existing) {
        return res.status(400).json({ error: 'Já existe um exemplo Default para este componente. Edite o existente.' });
      }
    }

    if (type === 'variation') {
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Título é obrigatório para variação' });
      }
    }

    const payload = {
      componentId: Number(componentId),
      type: type || 'variation',
      title: type === 'default' ? 'Default' : (title ? String(title).trim() : null),
      slug: type === 'default' ? 'default' : (slug ? String(slug).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null),
      description: description ? String(description).trim() : null,
      order: type === 'default' ? 0 : (Number(order) ?? 0),
      propsTokens: Array.isArray(propsTokens) ? propsTokens : [],
      codeSnippet: codeSnippet != null ? String(codeSnippet).trim() : null,
      codeCss: codeCss != null ? String(codeCss).trim() : null,
      codeJs: codeJs != null ? String(codeJs).trim() : null,
      codeCustom: Boolean(codeCustom),
      renderConfig: renderConfig || null,
    };

    const example = await Example.create(payload);
    res.status(201).json(example);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { componentId, id } = req.params;
    const { title, slug, description, order, propsTokens, codeSnippet, codeCss, codeJs, codeCustom, renderConfig } = req.body;

    const example = await Example.findOne({ where: { id, componentId } });
    if (!example) {
      return res.status(404).json({ error: 'Exemplo não encontrado' });
    }

    if (example.type === 'variation') {
      if (title !== undefined) example.title = title ? String(title).trim() : null;
      if (title !== undefined && !example.title) {
        return res.status(400).json({ error: 'Título é obrigatório para variação' });
      }
      if (order !== undefined) example.order = Number(order) ?? 0;
    } else {
      if (title !== undefined) example.title = 'Default';
    }

    if (description !== undefined) example.description = description ? String(description).trim() : null;
    if (example.type === 'variation' && slug !== undefined) example.slug = slug ? String(slug).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null;
    if (propsTokens !== undefined) example.propsTokens = Array.isArray(propsTokens) ? propsTokens : example.propsTokens;
    if (codeSnippet !== undefined) example.codeSnippet = codeSnippet != null ? String(codeSnippet).trim() : null;
    if (codeCss !== undefined) example.codeCss = codeCss != null ? String(codeCss).trim() : null;
    if (codeJs !== undefined) example.codeJs = codeJs != null ? String(codeJs).trim() : null;
    if (codeCustom !== undefined) example.codeCustom = Boolean(codeCustom);
    if (renderConfig !== undefined) example.renderConfig = renderConfig || null;

    await example.save();
    res.json(example);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { componentId, id } = req.params;
    const example = await Example.findOne({ where: { id, componentId } });
    if (!example) {
      return res.status(404).json({ error: 'Exemplo não encontrado' });
    }
    if (example.type === 'default') {
      return res.status(400).json({ error: 'Não é permitido excluir o exemplo Default. Edite-o para alterar.' });
    }
    await example.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function reorder(req, res, next) {
  try {
    const { componentId } = req.params;
    const { variationIds } = req.body;
    if (!Array.isArray(variationIds) || variationIds.length === 0) {
      return res.status(400).json({ error: 'Envie variationIds como array de ids na ordem desejada' });
    }

    const examples = await Example.findAll({
      where: { componentId, type: 'variation' },
    });
    const idSet = new Set(variationIds.map(Number));
    for (let i = 0; i < variationIds.length; i++) {
      const ex = examples.find((e) => e.id === Number(variationIds[i]));
      if (ex) {
        ex.order = i;
        await ex.save();
      }
    }
    const updated = await Example.findAll({
      where: { componentId },
      order: [['type', 'ASC'], ['order', 'ASC']],
    });
    res.json({ default: updated.find((e) => e.type === 'default') || null, variations: updated.filter((e) => e.type === 'variation') });
  } catch (err) {
    next(err);
  }
}

module.exports = { listByComponent, create, update, remove, reorder };
