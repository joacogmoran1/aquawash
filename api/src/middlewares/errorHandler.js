const logger = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

function errorHandler(err, req, res, next) {
	logger.error(
		{
			err,
			method: req.method,
			url: req.originalUrl,
			// No loguear el body completo en prod (puede tener passwords)
			...(isProd ? {} : { body: req.body }),
		},
		err.message
	);

	// ── Errores de validación de Sequelize ──────────────────────
	if (
		err.name === 'SequelizeValidationError' ||
		err.name === 'SequelizeUniqueConstraintError'
	) {
		// FIX: en producción no exponer nombres de columnas
		const fields = isProd
			? undefined
			: err.errors?.map((e) => ({ field: e.path, message: e.message }));

		// Mensaje específico para duplicados (email ya registrado, etc.)
		const isUnique = err.name === 'SequelizeUniqueConstraintError';

		return res.status(422).json({
			error: isUnique
				? 'Ya existe un registro con esos datos.'
				: 'Error de validación.',
			...(fields && { fields }),
		});
	}

	// ── FK a recurso inexistente ─────────────────────────────────
	if (err.name === 'SequelizeForeignKeyConstraintError') {
		return res.status(422).json({ error: 'Referencia a un recurso que no existe.' });
	}

	// ── Error de conexión a BD ───────────────────────────────────
	if (
		err.name === 'SequelizeConnectionError' ||
		err.name === 'SequelizeConnectionRefusedError' ||
		err.name === 'SequelizeConnectionTimedOutError'
	) {
		return res.status(503).json({ error: 'Servicio temporalmente no disponible.' });
	}

	// ── Error operacional con status conocido ───────────────────
	if (err.status) {
		return res.status(err.status).json({ error: err.message });
	}

	// ── Error inesperado ─────────────────────────────────────────
	return res.status(500).json({
		error: isProd
			? 'Error interno del servidor.'
			: err.message,
	});
}

function createError(status, message) {
	const err = new Error(message);
	err.status = status;
	return err;
}

module.exports = { errorHandler, createError };