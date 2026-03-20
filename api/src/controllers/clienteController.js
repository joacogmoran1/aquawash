const { Cliente, Auto, OrdenLavado } = require('../models');
const { createError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// notas ELIMINADO de campos editables
const CAMPOS_EDITABLES = ['nombre', 'telefono', 'email'];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9+\-() ]+$/;
const LIMITES = { nombre: 120, telefono: 30, email: 150, search: 100 };

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function pick(obj, keys) {
	return keys.reduce((out, k) => {
		if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined)
			out[k] = obj[k];
		return out;
	}, {});
}

const sanitize = (v) => typeof v !== 'string' ? v : v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
const sanitizeNull = (v) => { if (v == null) return null; const s = sanitize(v); return s || null; };
const sanitizeEmail = (v) => typeof v !== 'string' ? v : v.toLowerCase().replace(/[<>\s]/g, '').trim();
const sanitizePhone = (v) => typeof v !== 'string' ? v : v.replace(/[^\d+\-() ]/g, '').replace(/\s+/g, ' ').trim();
const escapeLike = (v) => v.replace(/[\\%_]/g, '\\$&');

function assertLen(v, max, f) {
	if (v != null && String(v).length > max) throw createError(400, `${f} supera la longitud máxima.`);
}

function normalizeNombre(v) {
	const s = sanitize(v);
	if (!s) throw createError(400, 'nombre es requerido.');
	assertLen(s, LIMITES.nombre, 'nombre');
	return s;
}
function normalizeTelefono(v) {
	const s = sanitizePhone(v);
	if (!s) throw createError(400, 'telefono es requerido.');
	if (!REGEX_TELEFONO.test(s)) throw createError(400, 'telefono inválido.');
	assertLen(s, LIMITES.telefono, 'telefono');
	return s;
}
function normalizeEmailOpt(v) {
	const s = sanitizeNull(sanitizeEmail(v));
	if (s == null) return null;
	if (!REGEX_EMAIL.test(s)) throw createError(400, 'email inválido.');
	assertLen(s, LIMITES.email, 'email');
	return s;
}

function parsePagination(q) {
	const page = Math.max(1, parseInt(q.page, 10) || 1);
	const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(q.limit, 10) || DEFAULT_LIMIT));
	const offset = (page - 1) * limit;
	return { page, limit, offset };
}

// FIX #6: query de conteo separada para evitar bug GROUP BY + LIMIT en Sequelize
async function listar(req, res, next) {
	try {
		const { HistorialServicio } = require('../models');
		const { fn, col } = require('sequelize');
		const { page, limit, offset } = parsePagination(req.query);

		const where = { lavadero_id: req.lavaderoId };

		if (typeof req.query.search === 'string' && req.query.search.trim()) {
			const s = sanitize(req.query.search);
			assertLen(s, LIMITES.search, 'search');
			const safe = escapeLike(s);
			where[Op.or] = [
				{ nombre: { [Op.iLike]: `%${safe}%` } },
				{ email: { [Op.iLike]: `%${safe}%` } },
				{ telefono: { [Op.iLike]: `%${safe}%` } },
			];
		}

		// Conteo simple, sin GROUP BY
		const total = await Cliente.count({ where });

		const clientes = await Cliente.findAll({
			where,
			include: [
				{ model: Auto, attributes: ['id', 'marca', 'modelo', 'patente', 'color', 'year'] },
				{ model: HistorialServicio, attributes: [], required: false },
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
			subQuery: false,
		});

		res.json({
			data: clientes,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		});
	} catch (err) { next(err); }
}

async function obtener(req, res, next) {
	try {
		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
			include: [
				{ model: Auto, attributes: ['id', 'marca', 'modelo', 'patente', 'color', 'year'] },
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
	} catch (err) { next(err); }
}

async function historial(req, res, next) {
	try {
		const { HistorialServicio } = require('../models');
		const { page, limit, offset } = parsePagination(req.query);

		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		const { count, rows } = await HistorialServicio.findAndCountAll({
			where: { cliente_id: req.params.id, lavadero_id: req.lavaderoId },
			order: [['fecha_entrega', 'DESC']],
			limit,
			offset,
		});

		res.json({
			data: rows,
			pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
		});
	} catch (err) { next(err); }
}

async function crear(req, res, next) {
	try {
		const raw = pick(req.body, CAMPOS_EDITABLES);
		const cliente = await Cliente.create({
			nombre: normalizeNombre(raw.nombre),
			telefono: normalizeTelefono(raw.telefono),
			email: normalizeEmailOpt(raw.email),
			lavadero_id: req.lavaderoId,
		});
		res.status(201).json(cliente);
	} catch (err) { next(err); }
}

async function actualizar(req, res, next) {
	try {
		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		const raw = pick(req.body, CAMPOS_EDITABLES);
		if (!Object.keys(raw).length) throw createError(400, 'No se enviaron campos válidos.');

		const patch = {};
		if ('nombre' in raw) patch.nombre = normalizeNombre(raw.nombre);
		if ('telefono' in raw) patch.telefono = normalizeTelefono(raw.telefono);
		if ('email' in raw) patch.email = normalizeEmailOpt(raw.email);

		await cliente.update(patch);
		res.json(cliente);
	} catch (err) { next(err); }
}

async function eliminar(req, res, next) {
	try {
		const { HistorialServicio } = require('../models');

		const cliente = await Cliente.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		// Eliminar historial primero para evitar FK violation
		await HistorialServicio.destroy({
			where: { cliente_id: req.params.id },
		});

		await cliente.destroy();
		res.status(204).send();
	} catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, historial };