const logger = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

const SENSITIVE_FIELDS = ['password', 'password_hash', 'token', 'reset_password_token',
	'email_verify_token', 'authorization'];

function sanitizeForLog(obj) {
	if (!obj || typeof obj !== 'object') return obj;
	return Object.fromEntries(
		Object.entries(obj).map(([k, v]) =>
			SENSITIVE_FIELDS.some(f => k.toLowerCase().includes(f))
				? [k, '[REDACTED]']
				: [k, v]
		)
	);
}

function errorHandler(err, req, res, next) {
	logger.error(
		{
			err,
			method: req.method,
			url: req.originalUrl,
			...(isProd ? {} : { body: sanitizeForLog(req.body) }),
		},
		err.message
	);

	if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
		const fields = isProd
			? undefined
			: err.errors?.map((e) => ({ field: e.path, message: e.message }));
		const isUnique = err.name === 'SequelizeUniqueConstraintError';
		return res.status(422).json({
			error: isUnique ? 'Ya existe un registro con esos datos.' : 'Error de validación.',
			...(fields && { fields }),
		});
	}

	if (err.name === 'SequelizeForeignKeyConstraintError')
		return res.status(422).json({ error: 'Referencia a un recurso que no existe.' });

	if (['SequelizeConnectionError', 'SequelizeConnectionRefusedError',
		'SequelizeConnectionTimedOutError'].includes(err.name))
		return res.status(503).json({ error: 'Servicio temporalmente no disponible.' });

	if (err.status)
		return res.status(err.status).json({ error: err.message });

	return res.status(500).json({
		error: isProd ? 'Error interno del servidor.' : err.message,
	});
}

function createError(status, message) {
	const err = new Error(message);
	err.status = status;
	return err;
}

module.exports = { errorHandler, createError };