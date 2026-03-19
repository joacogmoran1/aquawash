const { Cliente, Auto, OrdenLavado } = require('../models');
const { createError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

const CAMPOS_EDITABLES = ['nombre', 'telefono', 'email', 'notas'];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9+\-() ]+$/;

const LIMITES = { nombre: 120, telefono: 30, email: 150, notas: 1000, search: 100 };

// Paginación: máx 100 por página, default 50
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

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
	return value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function sanitizeNullableText(value) {
	if (value == null) return null;
	const sanitized = sanitizeText(value);
	return sanitized === '' ? null : sanitized;
}

function sanitizeEmail(value) {
	if (typeof value !== 'string') return value;
	return value.toLowerCase().replace(/[<>]/g, '').replace(/\s+/g, '').trim();
}

function sanitizePhone(value) {
	if (typeof value !== 'string') return value;
	return value.replace(/[^\d+\-() ]/g, '').replace(/\s+/g, ' ').trim();
}

function escapeLike(value) {
	return value.replace(/[\\%_]/g, '\\$&');
}

function assertMaxLength(value, max, fieldName) {
	if (value != null && String(value).length > max) {
		throw createError(400, `${fieldName} supera la longitud máxima permitida.`);
	}
}

function normalizeNombre(value) {
	const nombre = sanitizeText(value);
	if (!nombre) throw createError(400, 'nombre es requerido.');
	assertMaxLength(nombre, LIMITES.nombre, 'nombre');
	return nombre;
}

function normalizeTelefono(value) {
	const telefono = sanitizePhone(value);
	if (!telefono) throw createError(400, 'telefono es requerido.');
	if (!REGEX_TELEFONO.test(telefono)) throw createError(400, 'telefono inválido.');
	assertMaxLength(telefono, LIMITES.telefono, 'telefono');
	return telefono;
}

function normalizeEmailOptional(value) {
	const email = sanitizeNullableText(sanitizeEmail(value));
	if (email == null) return null;
	if (!REGEX_EMAIL.test(email)) throw createError(400, 'email inválido.');
	assertMaxLength(email, LIMITES.email, 'email');
	return email;
}

function normalizeNotasOptional(value) {
	const notas = sanitizeNullableText(value);
	if (notas == null) return null;
	assertMaxLength(notas, LIMITES.notas, 'notas');
	return notas;
}

// ── Parsear parámetros de paginación ─────────────────────────
function parsePagination(query) {
	const page = Math.max(1, parseInt(query.page, 10) || 1);
	const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
	const offset = (page - 1) * limit;
	return { page, limit, offset };
}

async function listar(req, res, next) {
	try {
		const { HistorialServicio } = require('../models');
		const { fn, col } = require('sequelize');

		const { page, limit, offset } = parsePagination(req.query);

		const where = { lavadero_id: req.lavaderoId };

		if (typeof req.query.search === 'string' && req.query.search.trim()) {
			const search = sanitizeText(req.query.search);
			assertMaxLength(search, LIMITES.search, 'search');
			const safeSearch = escapeLike(search);
			where[Op.or] = [
				{ nombre: { [Op.iLike]: `%${safeSearch}%` } },
				{ email: { [Op.iLike]: `%${safeSearch}%` } },
				{ telefono: { [Op.iLike]: `%${safeSearch}%` } },
			];
		}

		const { count, rows: clientes } = await Cliente.findAndCountAll({
			where,
			include: [
				{
					model: Auto,
					attributes: ['id', 'marca', 'modelo', 'patente', 'color', 'year'],
				},
				{
					model: HistorialServicio,
					attributes: [],
					required: false,
				},
			],
			attributes: {
				include: [
					[fn('COUNT', col('HistorialServicios.id')), 'cantidad_visitas'],
					[fn('MAX', col('HistorialServicios.fecha_entrega')), 'ultima_visita'],
				],
			},
			group: ['Cliente.id', 'Autos.id'],
			order: [['nombre', 'ASC']],
			limit,
			offset,
			subQuery: false, // necesario para que limit/offset funcionen con GROUP BY
		});

		res.json({
			data: clientes,
			pagination: {
				page,
				limit,
				total: count.length ?? count, // count es array cuando hay GROUP BY
				totalPages: Math.ceil((count.length ?? count) / limit),
			},
		});
	} catch (err) {
		next(err);
	}
}

async function obtener(req, res, next) {
	try {
		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
			include: [
				{
					model: Auto,
					attributes: ['id', 'marca', 'modelo', 'patente', 'color', 'year'],
				},
				{
					model: OrdenLavado,
					attributes: ['id', 'servicio_tipo', 'precio', 'estado', 'hora_llegada', 'hora_entrega'],
					include: [{ model: Auto, attributes: ['marca', 'modelo', 'patente'] }],
					separate: true,
					order: [['hora_llegada', 'DESC']],
					limit: 20,
				},
			],
		});

		if (!cliente) throw createError(404, 'Cliente no encontrado.');
		res.json(cliente);
	} catch (err) {
		next(err);
	}
}

async function historial(req, res, next) {
	try {
		const { HistorialServicio } = require('../models');
		const { page, limit, offset } = parsePagination(req.query);

		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		const { count, rows: registros } = await HistorialServicio.findAndCountAll({
			where: { cliente_id: req.params.id, lavadero_id: req.lavaderoId },
			order: [['fecha_entrega', 'DESC']],
			limit,
			offset,
		});

		res.json({
			data: registros,
			pagination: {
				page,
				limit,
				total: count,
				totalPages: Math.ceil(count / limit),
			},
		});
	} catch (err) { next(err); }
}

async function crear(req, res, next) {
	try {
		const rawPayload = pick(req.body, CAMPOS_EDITABLES);

		const payload = {
			nombre: normalizeNombre(rawPayload.nombre),
			telefono: normalizeTelefono(rawPayload.telefono),
			email: normalizeEmailOptional(rawPayload.email),
			notas: normalizeNotasOptional(rawPayload.notas),
		};

		const cliente = await Cliente.create({
			...payload,
			lavadero_id: req.lavaderoId,
		});

		res.status(201).json(cliente);
	} catch (err) {
		next(err);
	}
}

async function actualizar(req, res, next) {
	try {
		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		const rawPatch = pick(req.body, CAMPOS_EDITABLES);

		if (Object.keys(rawPatch).length === 0) {
			throw createError(400, 'No se enviaron campos válidos.');
		}

		const patch = {};

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'nombre'))
			patch.nombre = normalizeNombre(rawPatch.nombre);

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'telefono'))
			patch.telefono = normalizeTelefono(rawPatch.telefono);

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'email'))
			patch.email = normalizeEmailOptional(rawPatch.email);

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'notas'))
			patch.notas = normalizeNotasOptional(rawPatch.notas);

		await cliente.update(patch);
		res.json(cliente);
	} catch (err) {
		next(err);
	}
}

async function eliminar(req, res, next) {
	try {
		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		await cliente.destroy();
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

module.exports = { listar, obtener, crear, actualizar, eliminar, historial };