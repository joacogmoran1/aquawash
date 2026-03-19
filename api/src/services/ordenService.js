const { Op } = require('sequelize');
const sequelize = require('../config/database');
const OrdenLavado = require('../models/OrdenLavado');
const Pago = require('../models/Pago');
const Servicio = require('../models/Servicio');
const Cliente = require('../models/Cliente');
const Auto = require('../models/Auto');
const { createError } = require('../middlewares/errorHandler');

const TRANSICIONES = {
	agendado: 'esperando',
	esperando: 'lavando',
	lavando: 'listo',
	listo: 'entregado',
};

// FIX: incluir todos los estados posibles para que ?estado= no retorne 400
const ESTADOS_VALIDOS_FILTRO = [
	'agendado', 'esperando', 'lavando', 'listo', 'entregado', 'cancelado',
];

const SERVICIOS_VALIDOS = ['exterior', 'completo', 'detailing'];

function normalizeId(value, fieldName) {
	if (typeof value !== 'string' || !value.trim()) {
		throw createError(400, `${fieldName} inválido.`);
	}
	return value.trim();
}

function normalizeNullableId(value, fieldName) {
	if (value === undefined || value === null || value === '') return null;
	return normalizeId(value, fieldName);
}

function normalizeServicioTipo(value) {
	if (typeof value !== 'string' || !value.trim()) {
		throw createError(400, 'servicio_tipo es requerido.');
	}
	const safe = value.trim().toLowerCase();
	if (!SERVICIOS_VALIDOS.includes(safe)) {
		throw createError(400, 'servicio_tipo inválido.');
	}
	return safe;
}

function normalizeNotas(value) {
	if (value === undefined || value === null) return null;
	if (typeof value !== 'string') throw createError(400, 'notas inválidas.');
	const safe = value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
	return safe === '' ? null : safe;
}

// FIX: usar ESTADOS_VALIDOS_FILTRO completo
function normalizeEstadoFiltro(value) {
	if (value === undefined || value === null || value === '') return undefined;
	if (typeof value !== 'string') throw createError(400, 'estado inválido.');
	const safe = value.trim().toLowerCase();
	if (!ESTADOS_VALIDOS_FILTRO.includes(safe)) {
		throw createError(400, `estado inválido. Valores permitidos: ${ESTADOS_VALIDOS_FILTRO.join(', ')}`);
	}
	return safe;
}

function normalizeFecha(value) {
	if (value === undefined || value === null || value === '') return undefined;
	if (typeof value !== 'string') throw createError(400, 'fecha inválida.');
	const safe = value.trim();
	const parsed = new Date(`${safe}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) {
		throw createError(400, 'fecha inválida.');
	}
	return safe;
}

async function crear({ lavadero_id, cliente_id, auto_id, turno_id, servicio_tipo, notas }) {
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');
	const safeClienteId = normalizeId(cliente_id, 'cliente_id');
	const safeAutoId = normalizeId(auto_id, 'auto_id');
	const safeTurnoId = normalizeNullableId(turno_id, 'turno_id');
	const safeServicioTipo = normalizeServicioTipo(servicio_tipo);
	const safeNotas = normalizeNotas(notas);

	return sequelize.transaction(async (transaction) => {
		const servicio = await Servicio.findOne({
			where: {
				lavadero_id: safeLavaderoId,
				tipo: safeServicioTipo,
				activo: true,
			},
			transaction,
		});

		if (!servicio) {
			throw createError(404, `Servicio '${safeServicioTipo}' no encontrado o inactivo.`);
		}

		const cliente = await Cliente.findOne({
			where: { id: safeClienteId, lavadero_id: safeLavaderoId },
			transaction,
		});
		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		const auto = await Auto.findOne({
			where: { id: safeAutoId, lavadero_id: safeLavaderoId },
			transaction,
		});
		if (!auto) throw createError(404, 'Auto no encontrado.');

		const orden = await OrdenLavado.create(
			{
				lavadero_id: safeLavaderoId,
				cliente_id: safeClienteId,
				auto_id: safeAutoId,
				turno_id: safeTurnoId,
				servicio_tipo: safeServicioTipo,
				precio: Number(servicio.precio || 0),
				hora_llegada: new Date(),
				notas: safeNotas,
			},
			{ transaction }
		);

		return orden;
	});
}

async function avanzarEstado(id, lavadero_id) {
	const safeId = normalizeId(id, 'id');
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');

	return sequelize.transaction(async (transaction) => {
		const orden = await OrdenLavado.findOne({
			where: { id: safeId, lavadero_id: safeLavaderoId },
			transaction,
			lock: transaction.LOCK.UPDATE,
		});

		if (!orden) throw createError(404, 'Orden no encontrada.');

		const nextEstado = TRANSICIONES[orden.estado];
		if (!nextEstado) {
			throw createError(400, `La orden ya está en estado '${orden.estado}' y no puede avanzar.`);
		}

		const ahora = new Date();
		const patch = { estado: nextEstado };

		if (nextEstado === 'lavando') patch.hora_inicio = ahora;
		if (nextEstado === 'listo') patch.hora_fin = ahora;
		if (nextEstado === 'entregado') patch.hora_entrega = ahora;

		await orden.update(patch, { transaction });

		if (nextEstado === 'entregado') {
			const { Turno, HistorialServicio, Auto } = require('../models');

			if (orden.turno_id) {
				const turno = await Turno.findOne({ where: { id: orden.turno_id }, transaction });
				if (turno) await turno.destroy({ transaction });
			}

			const auto = await Auto.findByPk(orden.auto_id, { transaction });

			await HistorialServicio.create({
				lavadero_id: orden.lavadero_id,
				cliente_id: orden.cliente_id,
				auto_id: orden.auto_id,
				servicio_nombre: orden.servicio_tipo,
				precio: Number(orden.precio || 0),
				fecha_entrega: ahora,
				auto_marca: auto?.marca || null,
				auto_modelo: auto?.modelo || null,
				auto_patente: auto?.patente || null,
			}, { transaction });

			const pagoExistente = await Pago.findOne({ where: { orden_id: orden.id }, transaction });
			if (!pagoExistente) {
				await Pago.create({
					orden_id: orden.id,
					monto: Number(orden.precio || 0),
					metodo_pago: 'pendiente',
					estado: 'registrado',
					fecha: ahora,
				}, { transaction });
			}
		}

		return orden.reload({ transaction });
	});
}

// api/src/services/ordenService.js
// Reemplazá la función listar completa:

async function listar(lavadero_id, { estado, fecha, desde, hasta } = {}) {
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');
	const safeEstado = normalizeEstadoFiltro(estado);
	const safeFecha = normalizeFecha(fecha);
	const safeDesde = normalizeFecha(desde);
	const safeHasta = normalizeFecha(hasta);

	const where = { lavadero_id: safeLavaderoId };

	if (safeEstado) {
		where.estado = safeEstado;
	}

	if (safeFecha) {
		const inicio = new Date(`${safeFecha}T00:00:00`);
		const fin = new Date(`${safeFecha}T00:00:00`);
		fin.setDate(fin.getDate() + 1);
		where.hora_llegada = { [Op.gte]: inicio, [Op.lt]: fin };
	} else if (safeDesde || safeHasta) {
		where.hora_llegada = {};
		if (safeDesde) {
			where.hora_llegada[Op.gte] = new Date(`${safeDesde}T00:00:00`);
		}
		if (safeHasta) {
			const fin = new Date(`${safeHasta}T00:00:00`);
			fin.setDate(fin.getDate() + 1);
			where.hora_llegada[Op.lt] = fin;
		}
	}

	return OrdenLavado.findAll({
		where,
		include: [
			{ model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
			{ model: Auto, attributes: ['id', 'marca', 'modelo', 'patente', 'color'] },
		],
		order: [['hora_llegada', 'DESC']],
	});
}

async function obtener(id, lavadero_id) {
	const safeId = normalizeId(id, 'id');
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');

	const orden = await OrdenLavado.findOne({
		where: { id: safeId, lavadero_id: safeLavaderoId },
		include: [
			{ model: Cliente },
			{ model: Auto },
			{ model: Pago, required: false },
		],
	});

	if (!orden) throw createError(404, 'Orden no encontrada.');
	return orden;
}

async function cancelarEstado(id, lavadero_id) {
	const safeId = normalizeId(id, 'id');
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');

	const { Turno } = require('../models');

	const orden = await OrdenLavado.findOne({
		where: { id: safeId, lavadero_id: safeLavaderoId },
	});

	if (!orden) throw createError(404, 'Orden no encontrada.');

	if (['lavando', 'listo', 'entregado'].includes(orden.estado)) {
		throw createError(400, 'No se puede cancelar una orden que ya está en proceso o entregada.');
	}

	if (orden.estado === 'cancelado') {
		throw createError(400, 'La orden ya está cancelada.');
	}

	await orden.update({ estado: 'cancelado' });

	if (orden.turno_id) {
		const turno = await Turno.findOne({
			where: { id: orden.turno_id, lavadero_id: safeLavaderoId },
		});
		if (turno && turno.estado !== 'completado') {
			await turno.destroy();
		}
	}

	return orden.reload();
}

module.exports = { crear, avanzarEstado, listar, obtener, cancelarEstado };