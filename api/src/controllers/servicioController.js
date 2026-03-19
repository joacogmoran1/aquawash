const { Servicio } = require('../models');
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

function toPositiveNumber(value, fieldName) {
	const num = Number(value);
	if (!Number.isFinite(num) || num < 0) {
		throw createError(400, `${fieldName} debe ser un número válido.`);
	}
	return num;
}

function toPositiveInteger(value, fieldName) {
	const num = Number(value);
	if (!Number.isInteger(num) || num < 1) {
		throw createError(400, `${fieldName} debe ser un entero positivo.`);
	}
	return num;
}

async function listar(req, res, next) {
	try {
		const servicios = await Servicio.findAll({
			where: {
				lavadero_id: req.lavaderoId,
				activo: true,
			},
			order: [['nombre', 'ASC']],
		});

		res.json(servicios);
	} catch (err) {
		next(err);
	}
}

async function crear(req, res, next) {
	try {
		const payload = pick(req.body, [
			'nombre',
			'precio',
			'duracion_estimada_min',
			'capacidad_por_hora',
			'activo',
			'tipo',
		]);

		payload.nombre = normalizeString(payload.nombre);
		payload.tipo = normalizeString(payload.tipo);

		if (!payload.nombre) {
			throw createError(400, 'nombre es requerido.');
		}

		if (payload.precio === undefined) {
			throw createError(400, 'precio es requerido.');
		}

		const precio = toPositiveNumber(payload.precio, 'precio');

		const duracion =
			payload.duracion_estimada_min === undefined ||
				payload.duracion_estimada_min === null ||
				payload.duracion_estimada_min === ''
				? 30
				: toPositiveInteger(payload.duracion_estimada_min, 'duracion_estimada_min');

		const capacidad =
			payload.capacidad_por_hora === undefined ||
				payload.capacidad_por_hora === null ||
				payload.capacidad_por_hora === ''
				? 1
				: toPositiveInteger(payload.capacidad_por_hora, 'capacidad_por_hora');

		const activo =
			payload.activo === undefined
				? true
				: Boolean(payload.activo);

		const tipo = payload.tipo || 'personalizado';

		const servicio = await Servicio.create({
			lavadero_id: req.lavaderoId,
			nombre: payload.nombre,
			precio,
			duracion_estimada_min: duracion,
			capacidad_por_hora: capacidad,
			tipo,
			activo,
		});

		res.status(201).json(servicio);
	} catch (err) {
		next(err);
	}
}

async function actualizar(req, res, next) {
	try {
		const servicio = await Servicio.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});

		if (!servicio) throw createError(404, 'Servicio no encontrado.');

		const patch = pick(req.body, [
			'nombre',
			'precio',
			'duracion_estimada_min',
			'capacidad_por_hora',
			'activo',
		]);

		if (Object.prototype.hasOwnProperty.call(patch, 'nombre')) {
			patch.nombre = normalizeString(patch.nombre);
			if (!patch.nombre) {
				throw createError(400, 'El nombre no puede estar vacío.');
			}
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'precio')) {
			patch.precio = toPositiveNumber(patch.precio, 'precio');
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'duracion_estimada_min')) {
			patch.duracion_estimada_min = toPositiveInteger(
				patch.duracion_estimada_min,
				'duracion_estimada_min'
			);
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'capacidad_por_hora')) {
			patch.capacidad_por_hora = toPositiveInteger(
				patch.capacidad_por_hora,
				'capacidad_por_hora'
			);
		}

		if (Object.prototype.hasOwnProperty.call(patch, 'activo')) {
			patch.activo = Boolean(patch.activo);
		}

		if (Object.keys(patch).length === 0) {
			throw createError(400, 'No hay campos válidos para actualizar.');
		}

		await servicio.update(patch);

		res.json(servicio);
	} catch (err) {
		next(err);
	}
}

async function eliminar(req, res, next) {
	try {
		const servicio = await Servicio.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!servicio) throw createError(404, 'Servicio no encontrado.');
		await servicio.destroy();
		res.json({ message: 'Servicio eliminado.' });
	} catch (err) {
		next(err);
	}
}

module.exports = { listar, crear, actualizar, eliminar };