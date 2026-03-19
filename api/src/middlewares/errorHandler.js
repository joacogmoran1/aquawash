function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${err.message}`, err.stack);

  // Errores de Sequelize: validación
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      error:  'Error de validación.',
      fields: err.errors?.map(e => ({ field: e.path, message: e.message })),
    });
  }

  // Error de FK (registro relacionado no existe)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(422).json({ error: 'Referencia a un recurso que no existe.' });
  }

  // Error operacional conocido (lanzado con status)
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Error inesperado
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor.'
      : err.message,
  });
}

// Helper para crear errores con status HTTP
function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { errorHandler, createError };
