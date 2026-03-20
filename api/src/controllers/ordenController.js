const ordenService = require('../services/ordenService');
const { createError } = require('../middlewares/errorHandler');

function trim(v) {
	return typeof v === 'string' ? v.trim() : v;
}

function trimNullable(v) {
	if (v == null || v === '') return null;
	return typeof v === 'string' ? v.trim() || null : v;
}

const ESTADOS_VALIDOS = ['agendado', 'esperando', 'lavando', 'listo', 'entregado', 'cancelado'];

async function listar(req, res, next) {
	try {
		const filters = {};
		const { estado, fecha, desde, hasta } = req.query;

		if (typeof estado === 'string' && estado.trim() && ESTADOS_VALIDOS.includes(estado.trim()))
			filters.estado = estado.trim();
		if (typeof fecha === 'string' && fecha.trim()) filters.fecha = fecha.trim();
		if (typeof desde === 'string' && desde.trim()) filters.desde = desde.trim();
		if (typeof hasta === 'string' && hasta.trim()) filters.hasta = hasta.trim();

		res.json(await ordenService.listar(req.lavaderoId, filters));
	} catch (err) { next(err); }
}

async function obtener(req, res, next) {
	try {
		res.json(await ordenService.obtener(req.params.id, req.lavaderoId));
	} catch (err) { next(err); }
}

// FIX #1: acepta servicio_id, elimina servicio_tipo y notas
async function crear(req, res, next) {
	try {
		const { cliente_id, auto_id, servicio_id, turno_id } = req.body;

		if (!cliente_id) throw createError(400, 'cliente_id es requerido.');
		if (!auto_id) throw createError(400, 'auto_id es requerido.');
		if (!servicio_id) throw createError(400, 'servicio_id es requerido.');

		const orden = await ordenService.crear({
			cliente_id: trim(cliente_id),
			auto_id: trim(auto_id),
			servicio_id: trim(servicio_id),
			turno_id: trimNullable(turno_id),
			lavadero_id: req.lavaderoId,
		});

		res.status(201).json(orden);
	} catch (err) { next(err); }
}

// Sin notas, PUT solo retorna la orden actual (reservado para uso futuro)
async function actualizar(req, res, next) {
	try {
		const { OrdenLavado } = require('../models');
		const orden = await OrdenLavado.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!orden) throw createError(404, 'Orden no encontrada.');
		res.json(orden);
	} catch (err) { next(err); }
}

async function avanzarEstado(req, res, next) {
	try {
		res.json(await ordenService.avanzarEstado(req.params.id, req.lavaderoId));
	} catch (err) { next(err); }
}

async function cancelarEstado(req, res, next) {
	try {
		res.json(await ordenService.cancelarEstado(req.params.id, req.lavaderoId));
	} catch (err) { next(err); }
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

module.exports = { listar, obtener, crear, actualizar, avanzarEstado, cancelarEstado, limpiarFinalizadas };