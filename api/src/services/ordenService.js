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

const ESTADOS_VALIDOS_FILTRO = ['agendado', 'esperando', 'lavando', 'listo', 'entregado', 'cancelado'];

function normalizeId(value, fieldName) {
	if (typeof value !== 'string' || !value.trim()) throw createError(400, `${fieldName} inválido.`);
	return value.trim();
}

function normalizeNullableId(value) {
	if (value === undefined || value === null || value === '') return null;
	return normalizeId(value, 'turno_id');
}

function normalizeEstadoFiltro(value) {
	if (!value) return undefined;
	const safe = String(value).trim().toLowerCase();
	if (!ESTADOS_VALIDOS_FILTRO.includes(safe))
		throw createError(400, `estado inválido. Valores: ${ESTADOS_VALIDOS_FILTRO.join(', ')}`);
	return safe;
}

function normalizeFecha(value) {
	if (!value) return undefined;
	const safe = String(value).trim();
	const parsed = new Date(`${safe}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) throw createError(400, 'fecha inválida.');
	return safe;
}

// FIX #1: acepta servicio_id, busca por ID (no por tipo), elimina notas
async function crear({ lavadero_id, cliente_id, auto_id, turno_id, servicio_id }) {
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');
	const safeClienteId = normalizeId(cliente_id, 'cliente_id');
	const safeAutoId = normalizeId(auto_id, 'auto_id');
	const safeServicioId = normalizeId(servicio_id, 'servicio_id');
	const safeTurnoId = normalizeNullableId(turno_id);

	return sequelize.transaction(async (t) => {
		// FIX #1: buscar servicio por ID
		const servicio = await Servicio.findOne({
			where: { id: safeServicioId, lavadero_id: safeLavaderoId, activo: true },
			transaction: t,
		});
		if (!servicio) throw createError(404, 'Servicio no encontrado o inactivo.');

		const cliente = await Cliente.findOne({
			where: { id: safeClienteId, lavadero_id: safeLavaderoId },
			transaction: t,
		});
		if (!cliente) throw createError(404, 'Cliente no encontrado.');

		const auto = await Auto.findOne({
			where: { id: safeAutoId, lavadero_id: safeLavaderoId },
			transaction: t,
		});
		if (!auto) throw createError(404, 'Auto no encontrado.');

		return OrdenLavado.create({
			lavadero_id: safeLavaderoId,
			cliente_id: safeClienteId,
			auto_id: safeAutoId,
			turno_id: safeTurnoId,
			servicio_id: safeServicioId,
			servicio_tipo: servicio.nombre,
			precio: Number(servicio.precio || 0),
			hora_llegada: new Date(),
		}, { transaction: t });
	});
}

async function avanzarEstado(id, lavadero_id) {
	const safeId = normalizeId(id, 'id');
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');

	return sequelize.transaction(async (t) => {
		const orden = await OrdenLavado.findOne({
			where: { id: safeId, lavadero_id: safeLavaderoId },
			transaction: t,
			lock: t.LOCK.UPDATE,
		});
		if (!orden) throw createError(404, 'Orden no encontrada.');

		const nextEstado = TRANSICIONES[orden.estado];
		if (!nextEstado)
			throw createError(400, `La orden está en '${orden.estado}' y no puede avanzar.`);

		const ahora = new Date();
		const patch = { estado: nextEstado };
		if (nextEstado === 'lavando') patch.hora_inicio = ahora;
		if (nextEstado === 'listo') patch.hora_fin = ahora;
		if (nextEstado === 'entregado') patch.hora_entrega = ahora;

		await orden.update(patch, { transaction: t });

		if (nextEstado === 'entregado') {
			const { Turno, HistorialServicio, Auto } = require('../models');

			if (orden.turno_id) {
				const turno = await Turno.findOne({ where: { id: orden.turno_id }, transaction: t });
				if (turno) await turno.destroy({ transaction: t });
			}

			const auto = await Auto.findByPk(orden.auto_id, { transaction: t });

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
			}, { transaction: t });

			const pagoExistente = await Pago.findOne({ where: { orden_id: orden.id }, transaction: t });
			if (!pagoExistente) {
				await Pago.create({
					orden_id: orden.id,
					monto: Number(orden.precio || 0),
					metodo_pago: 'pendiente',
					estado: 'registrado',
					fecha: ahora,
				}, { transaction: t });
			}
		}

		return orden.reload({ transaction: t });
	});
}

async function listar(lavadero_id, { estado, fecha, desde, hasta } = {}) {
	const safeLavaderoId = normalizeId(lavadero_id, 'lavadero_id');
	const safeEstado = normalizeEstadoFiltro(estado);
	const safeFecha = normalizeFecha(fecha);
	const safeDesde = normalizeFecha(desde);
	const safeHasta = normalizeFecha(hasta);

	const where = { lavadero_id: safeLavaderoId };
	if (safeEstado) where.estado = safeEstado;

	// Construir filtro de fecha
	let fechaWhere = null;
	if (safeFecha) {
		const inicio = new Date(`${safeFecha}T00:00:00`);
		const fin = new Date(`${safeFecha}T00:00:00`);
		fin.setDate(fin.getDate() + 1);
		fechaWhere = { [Op.gte]: inicio, [Op.lt]: fin };
	} else if (safeDesde || safeHasta) {
		fechaWhere = {};
		if (safeDesde) fechaWhere[Op.gte] = new Date(`${safeDesde}T00:00:00`);
		if (safeHasta) {
			const fin = new Date(`${safeHasta}T00:00:00`);
			fin.setDate(fin.getDate() + 1);
			fechaWhere[Op.lt] = fin;
		}
	}

	// Si hay filtro de fecha, excluir siempre las órdenes agendadas del filtro
	// (los agendados son futuros y siempre deben aparecer)
	if (fechaWhere) {
		if (!safeEstado) {
			// Sin filtro de estado: traer las que están en rango OR las agendadas
			where[Op.or] = [
				{ hora_llegada: fechaWhere },
				{ estado: 'agendado' },
			];
		} else if (safeEstado !== 'agendado') {
			// Con filtro de estado específico (no agendado): aplicar fecha normalmente
			where.hora_llegada = fechaWhere;
		}
		// Si safeEstado === 'agendado': no aplicar filtro de fecha
	}

	return OrdenLavado.findAll({
		where,
		include: [
			{ model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
			{ model: Auto, attributes: ['id', 'marca', 'modelo', 'patente', 'color'] },
		],
		order: [['hora_llegada', 'ASC']],
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

	if (['lavando', 'listo', 'entregado'].includes(orden.estado))
		throw createError(400, 'No se puede cancelar una orden en proceso o entregada.');
	if (orden.estado === 'cancelado')
		throw createError(400, 'La orden ya está cancelada.');

	await orden.update({ estado: 'cancelado' });

	if (orden.turno_id) {
		const turno = await Turno.findOne({
			where: { id: orden.turno_id, lavadero_id: safeLavaderoId },
		});
		if (turno && turno.estado !== 'completado') await turno.destroy();
	}

	return orden.reload();
}

module.exports = { crear, avanzarEstado, listar, obtener, cancelarEstado };