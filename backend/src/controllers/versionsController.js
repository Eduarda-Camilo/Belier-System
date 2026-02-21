/**
 * Controller de versões: listar versões de um componente e criar nova versão (ao editar).
 * A criação de versão pode ser feita pelo frontend ao salvar alterações no componente.
 */

const { Version, Component } = require('../models');

async function listByComponent(req, res, next) {
  try {
    const { componentId } = req.params;
    const versions = await Version.findAll({
      where: { componentId },
      order: [['number', 'DESC']],
    });
    res.json(versions);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { componentId } = req.params;
    const { description } = req.body;
    const component = await Component.findByPk(componentId);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    const lastVersion = await Version.findOne({
      where: { componentId },
      order: [['number', 'DESC']],
    });
    const nextNumber = lastVersion ? lastVersion.number + 1 : 1;
    const content = {
      name: component.name,
      description: component.description,
      documentation: component.documentation,
      variations: component.variations,
      status: component.status,
    };
    const version = await Version.create({
      componentId: Number(componentId),
      number: nextNumber,
      description: description || `Versão ${nextNumber}`,
      content,
    });
    res.status(201).json(version);
  } catch (err) {
    next(err);
  }
}

module.exports = { listByComponent, create };
