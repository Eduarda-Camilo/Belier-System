/**
 * Middleware de autorização por perfil: só permite continuar se req.user.profile estiver na lista.
 *
 * Uso: authorize('admin') ou authorize('admin', 'designer').
 * Exemplo: router.put('/components/:id', auth, authorize('admin', 'designer'), updateComponent);
 *
 * Deve ser usado DEPOIS do middleware auth (que preenche req.user).
 */

function authorize(...allowedProfiles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    if (!allowedProfiles.includes(req.user.profile)) {
      return res.status(403).json({ error: 'Sem permissão para esta ação' });
    }
    next();
  };
}

module.exports = authorize;
