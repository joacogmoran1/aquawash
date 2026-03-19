const { Auto, Cliente } = require('../models');
const { createError } = require('../middlewares/errorHandler');

const CAMPOS_CREAR = ['cliente_id', 'marca', 'modelo', 'patente', 'color', 'year'];
const CAMPOS_EDITABLES = ['marca', 'modelo', 'patente', 'color', 'year'];

const LIMITES = {
	marca: 60,
	modelo: 80,
	patente: 20,
	color: 40,
};

function pick(obj, allowedKeys) {
	const out = {};
	for (const key of allowedKeys) {
		if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
			out[key] = obj[key];
		}
	}
	return out;
}

function sanitizeText(value) {
	if (typeof value !== 'string') return value;
	return value
		.replace(/[<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function sanitizeNullableText(value) {
	if (value == null) return null;
	const sanitized = sanitizeText(value);
	return sanitized === '' ? null : sanitized;
}

function normalizePatente(value) {
	if (typeof value !== 'string') return value;
	return value
		.toUpperCase()
		.replace(/[<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function assertMaxLength(value, max, fieldName) {
	if (value != null && String(value).length > max) {
		throw createError(400, `${fieldName} supera la longitud máxima permitida.`);
	}
}

function normalizeRequiredText(value, fieldName, maxLength) {
	const normalized = sanitizeText(value);
	if (!normalized) throw createError(400, `${fieldName} es requerido.`);
	assertMaxLength(normalized, maxLength, fieldName);
	return normalized;
}

function normalizeOptionalText(value, fieldName, maxLength) {
	const normalized = sanitizeNullableText(value);
	if (normalized == null) return null;
	assertMaxLength(normalized, maxLength, fieldName);
	return normalized;
}

function normalizePatenteField(value) {
	const patente = normalizePatente(value);
	if (!patente) throw createError(400, 'patente es requerida.');
	assertMaxLength(patente, LIMITES.patente, 'patente');
	return patente;
}

function normalizeYear(value) {
	if (value === undefined || value === null || value === '') return null;

	const num = Number(value);
	const currentYear = new Date().getFullYear() + 1;

	if (!Number.isInteger(num) || num < 1900 || num > currentYear) {
		throw createError(400, 'year inválido.');
	}

	return num;
}

async function assertClientePertenece(clienteId, lavaderoId) {
	const cliente = await Cliente.findOne({
		where: { id: clienteId, lavadero_id: lavaderoId },
	});

	if (!cliente) throw createError(404, 'Cliente no encontrado.');
	return cliente;
}

async function listar(req, res, next) {
	try {
		const where = { lavadero_id: req.lavaderoId };

		if (typeof req.query.cliente_id === 'string' && req.query.cliente_id.trim()) {
			where.cliente_id = req.query.cliente_id.trim();
		}

		const autos = await Auto.findAll({
			where,
			include: [{ model: Cliente, attributes: ['id', 'nombre', 'telefono'] }],
			order: [['created_at', 'DESC']],
		});

		res.json(autos);
	} catch (err) {
		next(err);
	}
}

async function obtener(req, res, next) {
	try {
		const auto = await Auto.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
			include: [{ model: Cliente, attributes: ['id', 'nombre', 'telefono', 'email'] }],
		});

		if (!auto) throw createError(404, 'Auto no encontrado.');

		res.json(auto);
	} catch (err) {
		next(err);
	}
}

async function crear(req, res, next) {
	try {
		const rawPayload = pick(req.body, CAMPOS_CREAR);

		if (!rawPayload.cliente_id) {
			throw createError(400, 'cliente_id es requerido.');
		}

		const clienteId = String(rawPayload.cliente_id).trim();
		await assertClientePertenece(clienteId, req.lavaderoId);

		const payload = {
			cliente_id: clienteId,
			marca: normalizeRequiredText(rawPayload.marca, 'marca', LIMITES.marca),
			modelo: normalizeRequiredText(rawPayload.modelo, 'modelo', LIMITES.modelo),
			patente: normalizePatenteField(rawPayload.patente),
			color: normalizeOptionalText(rawPayload.color, 'color', LIMITES.color),
			year: normalizeYear(rawPayload.year),
		};

		const auto = await Auto.create({
			...payload,
			lavadero_id: req.lavaderoId,
		});

		res.status(201).json(auto);
	} catch (err) {
		next(err);
	}
}

async function actualizar(req, res, next) {
	try {
		const auto = await Auto.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!auto) throw createError(404, 'Auto no encontrado.');

		const rawPatch = pick(req.body, CAMPOS_EDITABLES);

		if (Object.keys(rawPatch).length === 0) {
			throw createError(400, 'No se enviaron campos válidos.');
		}

		const patch = {};

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'marca')) {
			patch.marca = normalizeRequiredText(rawPatch.marca, 'marca', LIMITES.marca);
		}

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'modelo')) {
			patch.modelo = normalizeRequiredText(rawPatch.modelo, 'modelo', LIMITES.modelo);
		}

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'patente')) {
			patch.patente = normalizePatenteField(rawPatch.patente);
		}

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'color')) {
			patch.color = normalizeOptionalText(rawPatch.color, 'color', LIMITES.color);
		}

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'year')) {
			patch.year = normalizeYear(rawPatch.year);
		}

		await auto.update(patch);

		res.json(auto);
	} catch (err) {
		next(err);
	}
}

async function eliminar(req, res, next) {
	try {
		const auto = await Auto.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!auto) throw createError(404, 'Auto no encontrado.');

		await auto.destroy();

		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

module.exports = { listar, obtener, crear, actualizar, eliminar };