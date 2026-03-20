const { Turno, Cliente, Auto, Servicio } = require('../models');
const { createError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

const INCLUDE_DETALLE = [
	{ model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
	{ model: Auto, attributes: ['id', 'marca', 'modelo', 'patente', 'color'] },
	{ model: Servicio, attributes: ['id', 'tipo', 'nombre', 'precio'] },
];

const ESTADOS_VALIDOS = ['reservado', 'confirmado', 'cancelado', 'completado'];

function pick(obj, keys) {
	return keys.reduce((out, k) => {
		if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined)
			out[k] = obj[k];
		return out;
	}, {});
}

function trim(v) { return typeof v === 'string' ? v.trim() : v; }

function toMin(hhmm) {
	const [h, m] = hhmm.split(':').map(Number);
	return h * 60 + m;
}

// FIX #9: datetime con offset explícito Argentina (UTC-3)
// Evita que el servidor interprete la hora como su zona local (ej: UTC)
function buildArgDatetime(fecha, hora) {
	return new Date(`${fecha}T${hora}:00-03:00`);
}

async function assertPertenece(Model, id, lavaderoId, label) {
	const inst = await Model.findOne({ where: { id, lavadero_id: lavaderoId } });
	if (!inst) throw createError(404, `${label} no encontrado/a.`);
	return inst;
}

async function listar(req, res, next) {
	try {
		const where = { lavadero_id: req.lavaderoId };
		const { fecha, estado, cliente_id, desde, hasta } = req.query;

		if (typeof fecha === 'string' && fecha.trim()) where.fecha = fecha.trim();
		if (typeof estado === 'string' && ESTADOS_VALIDOS.includes(estado.trim()))
			where.estado = estado.trim();
		if (typeof cliente_id === 'string' && cliente_id.trim()) where.cliente_id = cliente_id.trim();

		if (desde || hasta) {
			where.fecha = {};
			if (typeof desde === 'string' && desde.trim()) where.fecha[Op.gte] = desde.trim();
			if (typeof hasta === 'string' && hasta.trim()) where.fecha[Op.lte] = hasta.trim();
			if (!Object.keys(where.fecha).length) delete where.fecha;
		}

		res.json(await Turno.findAll({ where, include: INCLUDE_DETALLE, order: [['fecha', 'ASC'], ['hora', 'ASC']] }));
	} catch (err) { next(err); }
}

async function obtener(req, res, next) {
	try {
		const turno = await Turno.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
			include: INCLUDE_DETALLE,
		});
		if (!turno) throw createError(404, 'Turno no encontrado.');
		res.json(turno);
	} catch (err) { next(err); }
}

async function crear(req, res, next) {
	try {
		// FIX: sin notas
		const { cliente_id, auto_id, servicio_id, fecha, hora, estado } = req.body;

		const [cliente, auto, servicio] = await Promise.all([
			assertPertenece(Cliente, trim(cliente_id), req.lavaderoId, 'Cliente'),
			assertPertenece(Auto, trim(auto_id), req.lavaderoId, 'Auto'),
			assertPertenece(Servicio, trim(servicio_id), req.lavaderoId, 'Servicio'),
		]);

		const { Lavadero, OrdenLavado } = require('../models');
		const lavadero = await Lavadero.findByPk(req.lavaderoId);
		if (!lavadero) throw createError(404, 'Lavadero no encontrado.');

		// Validar día de apertura
		const DIA_MAP = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
		const [y, m, d] = fecha.split('-').map(Number);
		const diaKey = DIA_MAP[new Date(y, m - 1, d).getDay()];
		if (!lavadero[diaKey]) throw createError(400, `El lavadero no abre los ${diaKey}.`);

		const apertura = lavadero[`${diaKey}_apertura`] || '00:00';
		const cierre = lavadero[`${diaKey}_cierre`] || '23:59';
		const horaMin = toMin(hora);
		if (horaMin < toMin(apertura) || horaMin >= toMin(cierre))
			throw createError(400, `Horario ${hora} fuera del rango de atención (${apertura}–${cierre}).`);

		// FIX #9: usar timezone Argentina
		const horaLlegada = buildArgDatetime(fecha, hora);
		if (horaLlegada <= new Date())
			throw createError(400, `No se puede agendar en el pasado (${fecha} ${hora}).`);

		// Validar capacidad
		const [hh] = hora.split(':').map(Number);
		const franjaInicio = `${String(hh).padStart(2, '0')}:00:00`;
		const franjaFin = hh + 1 < 24 ? `${String(hh + 1).padStart(2, '0')}:00:00` : '23:59:59';

		const enFranja = await Turno.count({
			where: {
				lavadero_id: req.lavaderoId,
				fecha,
				servicio_id: trim(servicio_id),
				hora: { [Op.gte]: franjaInicio, [Op.lt]: franjaFin },
				estado: { [Op.notIn]: ['cancelado'] },
			},
		});
		if (enFranja >= servicio.capacidad_por_hora)
			throw createError(400,
				`Cupo agotado para '${servicio.nombre}' entre ${String(hh).padStart(2, '0')}:00 y ${String(hh + 1).padStart(2, '0')}:00.`
			);

		if (estado && !ESTADOS_VALIDOS.includes(estado)) throw createError(400, 'Estado inválido.');

		const turno = await Turno.create({
			lavadero_id: req.lavaderoId,
			cliente_id: trim(cliente_id),
			auto_id: trim(auto_id),
			servicio_id: trim(servicio_id),
			fecha,
			hora,
			estado: estado || 'reservado',
		});

		// Orden asociada
		await OrdenLavado.create({
			lavadero_id: req.lavaderoId,
			cliente_id: trim(cliente_id),
			auto_id: trim(auto_id),
			turno_id: turno.id,
			servicio_tipo: servicio.nombre,
			precio: servicio.precio,
			estado: 'agendado',
			hora_llegada: horaLlegada,
		});

		res.status(201).json(await Turno.findByPk(turno.id, { include: INCLUDE_DETALLE }));
	} catch (err) { next(err); }
}

async function actualizar(req, res, next) {
	try {
		const turno = await Turno.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!turno) throw createError(404, 'Turno no encontrado.');
		if (turno.estado === 'completado') throw createError(400, 'No se puede modificar un turno completado.');

		// FIX: sin notas
		const patch = pick(req.body, ['cliente_id', 'auto_id', 'servicio_id', 'fecha', 'hora', 'estado']);

		if (patch.cliente_id) { patch.cliente_id = trim(patch.cliente_id); await assertPertenece(Cliente, patch.cliente_id, req.lavaderoId, 'Cliente'); }
		if (patch.auto_id) { patch.auto_id = trim(patch.auto_id); await assertPertenece(Auto, patch.auto_id, req.lavaderoId, 'Auto'); }
		if (patch.servicio_id) { patch.servicio_id = trim(patch.servicio_id); await assertPertenece(Servicio, patch.servicio_id, req.lavaderoId, 'Servicio'); }
		if (patch.fecha) patch.fecha = trim(patch.fecha);
		if (patch.hora) patch.hora = trim(patch.hora);

		if (patch.fecha || patch.hora) {
			const f = patch.fecha || turno.fecha;
			const h = patch.hora || turno.hora?.slice(0, 5);
			// FIX #9
			if (buildArgDatetime(f, h) <= new Date())
				throw createError(400, `No se puede mover un turno al pasado (${f} ${h}).`);
		}

		if (patch.estado) {
			patch.estado = trim(patch.estado);
			if (!ESTADOS_VALIDOS.includes(patch.estado)) throw createError(400, 'Estado inválido.');
		}

		await turno.update(patch);
		res.json(await Turno.findByPk(turno.id, { include: INCLUDE_DETALLE }));
	} catch (err) { next(err); }
}

async function eliminar(req, res, next) {
	try {
		const { OrdenLavado } = require('../models');
		const turno = await Turno.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!turno) throw createError(404, 'Turno no encontrado.');
		if (turno.estado === 'completado') throw createError(400, 'No se puede eliminar un turno completado.');

		await OrdenLavado.update(
			{ estado: 'cancelado' },
			{ where: { turno_id: turno.id, estado: 'agendado' } }
		);
		await turno.destroy();
		res.status(204).send();
	} catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };