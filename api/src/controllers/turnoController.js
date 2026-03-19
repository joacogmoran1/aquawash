const { Turno, Cliente, Auto, Servicio } = require('../models');
const { createError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

const INCLUDE_DETALLE = [
	{ model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
	{ model: Auto, attributes: ['id', 'marca', 'modelo', 'patente', 'color'] },
	{ model: Servicio, attributes: ['id', 'tipo', 'nombre', 'precio'] },
];

const ESTADOS_VALIDOS = ['reservado', 'confirmado', 'cancelado', 'completado'];

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

async function assertClientePertenece(clienteId, lavaderoId) {
	const cliente = await Cliente.findOne({
		where: { id: clienteId, lavadero_id: lavaderoId },
	});
	if (!cliente) throw createError(404, 'Cliente no encontrado.');
	return cliente;
}

async function assertAutoPertenece(autoId, lavaderoId) {
	const auto = await Auto.findOne({
		where: { id: autoId, lavadero_id: lavaderoId },
	});
	if (!auto) throw createError(404, 'Auto no encontrado.');
	return auto;
}

async function assertServicioPertenece(servicioId, lavaderoId) {
	const servicio = await Servicio.findOne({
		where: { id: servicioId, lavadero_id: lavaderoId },
	});
	if (!servicio) throw createError(404, 'Servicio no encontrado.');
	return servicio;
}

async function listar(req, res, next) {
	try {
		const where = { lavadero_id: req.lavaderoId };

		if (typeof req.query.fecha === 'string' && req.query.fecha.trim()) {
			where.fecha = req.query.fecha.trim();
		}

		if (
			typeof req.query.estado === 'string' &&
			req.query.estado.trim() &&
			ESTADOS_VALIDOS.includes(req.query.estado.trim())
		) {
			where.estado = req.query.estado.trim();
		}

		if (typeof req.query.cliente_id === 'string' && req.query.cliente_id.trim()) {
			where.cliente_id = req.query.cliente_id.trim();
		}

		if (req.query.desde || req.query.hasta) {
			where.fecha = {};

			if (typeof req.query.desde === 'string' && req.query.desde.trim()) {
				where.fecha[Op.gte] = req.query.desde.trim();
			}

			if (typeof req.query.hasta === 'string' && req.query.hasta.trim()) {
				where.fecha[Op.lte] = req.query.hasta.trim();
			}

			if (Object.keys(where.fecha).length === 0) {
				delete where.fecha;
			}
		}

		const turnos = await Turno.findAll({
			where,
			include: INCLUDE_DETALLE,
			order: [['fecha', 'ASC'], ['hora', 'ASC']],
		});

		res.json(turnos);
	} catch (err) {
		next(err);
	}
}

async function obtener(req, res, next) {
	try {
		const turno = await Turno.findOne({
			where: {
				id: req.params.id,
				lavadero_id: req.lavaderoId,
			},
			include: INCLUDE_DETALLE,
		});

		if (!turno) throw createError(404, 'Turno no encontrado.');

		res.json(turno);
	} catch (err) {
		next(err);
	}
}

async function crear(req, res, next) {
	try {
		const payload = pick(req.body, [
			'cliente_id', 'auto_id', 'servicio_id',
			'fecha', 'hora', 'estado', 'notas',
		]);

		payload.cliente_id = normalizeString(payload.cliente_id);
		payload.auto_id = normalizeString(payload.auto_id);
		payload.servicio_id = normalizeString(payload.servicio_id);
		payload.fecha = normalizeString(payload.fecha);
		payload.hora = normalizeString(payload.hora);
		payload.estado = normalizeString(payload.estado);
		payload.notas = normalizeNullableString(payload.notas);

		const [cliente, auto, servicio] = await Promise.all([
			assertClientePertenece(payload.cliente_id, req.lavaderoId),
			assertAutoPertenece(payload.auto_id, req.lavaderoId),
			assertServicioPertenece(payload.servicio_id, req.lavaderoId),
		]);

		// ── 1. Validar horario del lavadero ──────────────────────────
		const { Lavadero, OrdenLavado } = require('../models');
		const { Op } = require('sequelize');

		const lavadero = await Lavadero.findByPk(req.lavaderoId);
		if (!lavadero) throw createError(404, 'Lavadero no encontrado.');

		const DIA_MAP = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
		const [y, m, d] = payload.fecha.split('-').map(Number);
		const diaKey = DIA_MAP[new Date(y, m - 1, d).getDay()];

		if (!lavadero[diaKey]) {
			throw createError(400, `El lavadero no abre los ${diaKey}.`);
		}

		const apertura = lavadero[`${diaKey}_apertura`] || '00:00';
		const cierre = lavadero[`${diaKey}_cierre`] || '23:59';

		function toMin(hhmm) {
			const [h, min] = hhmm.split(':').map(Number);
			return h * 60 + min;
		}

		const horaMin = toMin(payload.hora);
		const aperturaMin = toMin(apertura);
		const cierreMin = toMin(cierre);

		if (horaMin < aperturaMin || horaMin >= cierreMin) {
			throw createError(400,
				`El horario ${payload.hora} está fuera del horario de atención (${apertura} - ${cierre}).`
			);
		}

		// ── 2. Validar que el turno no sea en el pasado ──────────────
		const ahora = new Date();
		const horaLlegada = new Date(`${payload.fecha}T${payload.hora}:00`);

		if (horaLlegada <= ahora) {
			throw createError(400,
				`No se puede agendar un turno en el pasado (${payload.fecha} ${payload.hora}).`
			);
		}

		// ── 3. Validar capacidad por franja horaria ──────────────────
		const [hh, mm] = payload.hora.split(':').map(Number);
		const franjaInicio = `${String(hh).padStart(2, '0')}:00:00`;
		const franjaFin = hh + 1 < 24
			? `${String(hh + 1).padStart(2, '0')}:00:00`
			: '23:59:59';

		const turnosEnFranja = await Turno.count({
			where: {
				lavadero_id: req.lavaderoId,
				fecha: payload.fecha,
				servicio_id: payload.servicio_id,
				hora: {
					[Op.gte]: franjaInicio,
					[Op.lt]: franjaFin,
				},
				estado: { [Op.notIn]: ['cancelado'] },
			},
		});

		if (turnosEnFranja >= servicio.capacidad_por_hora) {
			throw createError(400,
				`No hay lugar para '${servicio.nombre}' entre las ` +
				`${String(hh).padStart(2, '0')}:00 y las ${String(hh + 1).padStart(2, '0')}:00. ` +
				`Ya hay ${turnosEnFranja} de ${servicio.capacidad_por_hora} autos agendados.`
			);
		}

		// ── 4. Crear el turno ────────────────────────────────────────
		if (payload.estado && !ESTADOS_VALIDOS.includes(payload.estado)) {
			throw createError(400, 'Estado inválido.');
		}

		const turno = await Turno.create({
			lavadero_id: req.lavaderoId,
			cliente_id: payload.cliente_id,
			auto_id: payload.auto_id,
			servicio_id: payload.servicio_id,
			fecha: payload.fecha,
			hora: payload.hora,
			estado: payload.estado || 'reservado',
			notas: payload.notas,
		});

		// ── 5. Crear OrdenLavado agendada automáticamente ────────────
		await OrdenLavado.create({
			lavadero_id: req.lavaderoId,
			cliente_id: payload.cliente_id,
			auto_id: payload.auto_id,
			turno_id: turno.id,
			servicio_tipo: servicio.nombre,
			precio: servicio.precio,
			estado: 'agendado',
			hora_llegada: horaLlegada,
			notas: payload.notas,
		});

		// ── 6. Devolver turno con detalle ────────────────────────────
		const result = await Turno.findByPk(turno.id, {
			include: INCLUDE_DETALLE,
		});

		res.status(201).json(result);
	} catch (err) {
		next(err);
	}
}

async function actualizar(req, res, next) {
	try {
		const turno = await Turno.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!turno) throw createError(404, 'Turno no encontrado.');

		if (turno.estado === 'completado') {
			throw createError(400, 'No se puede modificar un turno completado.');
		}

		const patch = pick(req.body, [
			'cliente_id',
			'auto_id',
			'servicio_id',
			'fecha',
			'hora',
			'estado',
			'notas',
		]);

		if (Object.prototype.hasOwnProperty.call(patch, 'cliente_id')) {
			patch.cliente_id = normalizeString(patch.cliente_id);
			await assertClientePertenece(patch.cliente_id, req.lavaderoId);
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'auto_id')) {
			patch.auto_id = normalizeString(patch.auto_id);
			await assertAutoPertenece(patch.auto_id, req.lavaderoId);
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'servicio_id')) {
			patch.servicio_id = normalizeString(patch.servicio_id);
			await assertServicioPertenece(patch.servicio_id, req.lavaderoId);
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'fecha')) {
			patch.fecha = normalizeString(patch.fecha);
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'hora')) {
			patch.hora = normalizeString(patch.hora);
		}

		// Validar que si cambian fecha u hora, el nuevo turno no quede en el pasado
		const nuevaFecha = patch.fecha || turno.fecha;
		const nuevaHora = patch.hora || turno.hora?.slice(0, 5);

		if (patch.fecha || patch.hora) {
			const nuevaFechaHora = new Date(`${nuevaFecha}T${nuevaHora}:00`);
			if (nuevaFechaHora <= new Date()) {
				throw createError(400, `No se puede mover un turno al pasado (${nuevaFecha} ${nuevaHora}).`);
			}
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'estado')) {
			patch.estado = normalizeString(patch.estado);

			if (!ESTADOS_VALIDOS.includes(patch.estado)) {
				throw createError(400, 'Estado inválido.');
			}
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'notas')) {
			patch.notas = normalizeNullableString(patch.notas);
		}

		await turno.update(patch);

		const result = await Turno.findByPk(turno.id, {
			include: INCLUDE_DETALLE,
		});

		res.json(result);
	} catch (err) {
		next(err);
	}
}

async function eliminar(req, res, next) {
	try {
		const { OrdenLavado } = require('../models');

		const turno = await Turno.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!turno) throw createError(404, 'Turno no encontrado.');

		if (turno.estado === 'completado') {
			throw createError(400, 'No se puede eliminar un turno completado.');
		}

		// Cancelar la orden agendada asociada
		await OrdenLavado.update(
			{ estado: 'cancelado' },
			{ where: { turno_id: turno.id, estado: 'agendado' } }
		);

		await turno.destroy();

		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

module.exports = { listar, obtener, crear, actualizar, eliminar };