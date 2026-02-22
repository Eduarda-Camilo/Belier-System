/**
 * Controller de versões: listar versões de um componente e criar nova versão (ao editar).
 * Changelog: lista global de todas as atualizações para a tela ChangeLog.
 */

const { Version, Component, Example, User } = require('../models');

async function listByComponent(req, res, next) {
  try {
    const { componentId } = req.params;
    const versions = await Version.findAll({
      where: { componentId },
      order: [['number', 'DESC']],
      include: [{ model: User, as: 'createdBy', attributes: ['id', 'name'] }],
    });
    res.json(versions);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { componentId } = req.params;
    const { description, variationTitle } = req.body;
    const component = await Component.findByPk(componentId);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    const examples = await Example.findAll({
      where: { componentId },
      order: [
        ['type', 'ASC'],
        ['order', 'ASC'],
      ],
    });
    const defaultEx = examples.find((e) => e.type === 'default');
    const variationExs = examples.filter((e) => e.type === 'variation');
    const content = {
      name: component.name,
      title: component.title,
      description: component.description,
      documentation: component.documentation,
      variations: component.variations,
      status: component.status,
      defaultCode: defaultEx ? defaultEx.codeSnippet : null,
      variationsSnapshot: variationExs.map((e) => ({
        title: e.title,
        codeSnippet: e.codeSnippet,
      })),
    };
    const lastVersion = await Version.findOne({
      where: { componentId },
      order: [['number', 'DESC']],
    });
    const nextNumber = lastVersion ? lastVersion.number + 1 : 1;
    const version = await Version.create({
      componentId: Number(componentId),
      userId: req.user ? req.user.id : null,
      number: nextNumber,
      description: description || `Versão ${nextNumber}`,
      variationTitle: variationTitle || null,
      content,
    });
    res.status(201).json(version);
  } catch (err) {
    next(err);
  }
}

async function listChangelog(req, res, next) {
  try {
    const versions = await Version.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: Component, as: 'Component', attributes: ['id', 'name', 'title', 'slug'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name'] },
      ],
    });
    res.json(versions);
  } catch (err) {
    next(err);
  }
}

module.exports = { listByComponent, create, listChangelog };
