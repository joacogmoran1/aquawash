const { createError } = require('./errorHandler');

/**
 * Uso: requireRol('owner', 'admin')
 * Bloquea si el usuario autenticado no tiene uno de los roles permitidos.
 */
function requireRol(...roles) {
    return (req, res, next) => {
        if (!req.rol || !roles.includes(req.rol))
            return next(createError(403, 'No tenés permiso para esta acción.'));
        next();
    };
}

module.exports = requireRol;