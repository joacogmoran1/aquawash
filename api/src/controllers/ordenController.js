const ordenService = require('../services/ordenService');
const { createError } = require('../middlewares/errorHandler');

function pick(obj, allowedKeys) {
	const out = {};
	for (const key of allowedKeys) {
		if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
			out[key] = obj[key];
		}
	}
	return out;
}

function normalizeString(value) {
	if (typeof value !== 'string') return value;
	return value.trim();
}

function normalizeNullableString(value) {
	if (value == null) return null;
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}

const ESTADOS_VALIDOS_FILTRO = ['agendado', 'esperando', 'lavando', 'listo', 'entregado', 'cancelado'];
const SERVICIOS_VALIDOS = ['exterior', 'completo', 'detailing'];

// api/src/controllers/ordenController.js
// En la función listar, reemplazá:

// api/src/controllers/ordenController.js
// En la función listar, reemplazá:

async function listar(req, res, next) {
	try {
		const filters = {};

		if (
			typeof req.query.estado === 'string' &&
			req.query.estado.trim() &&
			ESTADOS_VALIDOS_FILTRO.includes(req.query.estado.trim())
		) {
			filters.estado = req.query.estado.trim();
		}

		if (typeof req.query.fecha === 'string' && req.query.fecha.trim()) {
			filters.fecha = req.query.fecha.trim();
		}

		// NUEVO: soporte para rango desde/hasta
		if (typeof req.query.desde === 'string' && req.query.desde.trim()) {
			filters.desde = req.query.desde.trim();
		}

		if (typeof req.query.hasta === 'string' && req.query.hasta.trim()) {
			filters.hasta = req.query.hasta.trim();
		}

		const ordenes = await ordenService.listar(req.lavaderoId, filters);
		res.json(ordenes);
	} catch (err) {
		next(err);
	}
}

async function obtener(req, res, next) {
	try {
		const orden = await ordenService.obtener(req.params.id, req.lavaderoId);
		res.json(orden);
	} catch (err) {
		next(err);
	}
}

async function crear(req, res, next) {
	try {
		const payload = pick(req.body, [
			'cliente_id',
			'auto_id',
			'servicio_tipo',
			'turno_id',
			'notas',
		]);

		payload.cliente_id = normalizeString(payload.cliente_id);
		payload.auto_id = normalizeString(payload.auto_id);
		payload.servicio_tipo = normalizeString(payload.servicio_tipo);
		payload.turno_id = normalizeNullableString(payload.turno_id);
		payload.notas = normalizeNullableString(payload.notas);

		if (!payload.cliente_id) {
			throw createError(400, 'cliente_id es requerido.');
		}

		if (!payload.auto_id) {
			throw createError(400, 'auto_id es requerido.');
		}

		if (!payload.servicio_tipo) {
			throw createError(400, 'servicio_tipo es requerido.');
		}

		if (!SERVICIOS_VALIDOS.includes(payload.servicio_tipo)) {
			throw createError(400, 'servicio_tipo inválido.');
		}

		const orden = await ordenService.crear({
			cliente_id: payload.cliente_id,
			auto_id: payload.auto_id,
			servicio_tipo: payload.servicio_tipo,
			turno_id: payload.turno_id,
			notas: payload.notas,
			lavadero_id: req.lavaderoId,
		});

		res.status(201).json(orden);
	} catch (err) {
		next(err);
	}
}

// PUT /ordenes/:id — actualiza campos editables (notas, etc.)
async function actualizar(req, res, next) {
	try {
		const { OrdenLavado } = require('../models');

		const orden = await OrdenLavado.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!orden) throw createError(404, 'Orden no encontrada.');

		const patch = pick(req.body, ['notas']);

		if (!Object.prototype.hasOwnProperty.call(patch, 'notas')) {
			throw createError(400, 'No hay campos válidos para actualizar.');
		}

		patch.notas = normalizeNullableString(patch.notas);

		await orden.update({ notas: patch.notas });

		res.json(orden);
	} catch (err) {
		next(err);
	}
}

// POST /ordenes/:id/avanzar — máquina de estados
async function avanzarEstado(req, res, next) {
	try {
		const orden = await ordenService.avanzarEstado(req.params.id, req.lavaderoId);
		res.json(orden);
	} catch (err) {
		next(err);
	}
}

async function limpiarFinalizadas(req, res, next) {
	try {
		const { OrdenLavado } = require('../models');
		const { Op } = require('sequelize');

		const deleted = await OrdenLavado.destroy({
			where: {
				lavadero_id: req.lavaderoId,
				estado: { [Op.in]: ['entregado', 'cancelado'] },
			},
		});

		res.json({ eliminadas: deleted });
	} catch (err) { next(err); }
}

async function cancelarEstado(req, res, next) {
	try {
		const orden = await ordenService.cancelarEstado(req.params.id, req.lavaderoId);
		res.json(orden);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	listar, obtener, crear, actualizar,
	avanzarEstado, cancelarEstado,
	limpiarFinalizadas
};