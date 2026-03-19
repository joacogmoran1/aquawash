const { Lavadero } = require('../models');
const { createError } = require('../middlewares/errorHandler');

const CAMPOS_EDITABLES = ['nombre', 'email', 'telefono', 'direccion'];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9+\-() ]+$/;

const LIMITES = {
	nombre: 120,
	email: 150,
	telefono: 30,
	direccion: 180,
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

function sanitizeEmail(value) {
	if (typeof value !== 'string') return value;
	return value
		.toLowerCase()
		.replace(/[<>]/g, '')
		.replace(/\s+/g, '')
		.trim();
}

function sanitizePhone(value) {
	if (typeof value !== 'string') return value;
	return value
		.replace(/[^\d+\-() ]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
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

function normalizeEmail(value) {
	const email = sanitizeEmail(value);
	if (!email) throw createError(400, 'email es requerido.');
	if (!REGEX_EMAIL.test(email)) throw createError(400, 'email inválido.');
	assertMaxLength(email, LIMITES.email, 'email');
	return email;
}

function normalizeTelefono(value) {
	const telefono = sanitizePhone(value);
	if (!telefono) throw createError(400, 'telefono es requerido.');
	if (!REGEX_TELEFONO.test(telefono)) {
		throw createError(400, 'telefono inválido.');
	}
	assertMaxLength(telefono, LIMITES.telefono, 'telefono');
	return telefono;
}

function normalizeDireccion(value) {
	const direccion = sanitizeText(value);
	if (!direccion) throw createError(400, 'direccion es requerida.');
	assertMaxLength(direccion, LIMITES.direccion, 'direccion');
	return direccion;
}

async function getMe(req, res, next) {
	try {
		res.json(req.lavadero);
	} catch (err) {
		next(err);
	}
}

async function update(req, res, next) {
	try {
		if (String(req.params.id).trim() !== String(req.lavaderoId)) {
			throw createError(403, 'Acceso denegado.');
		}

		const rawPatch = pick(req.body, CAMPOS_EDITABLES);

		if (Object.keys(rawPatch).length === 0) {
			throw createError(400, 'No se enviaron campos válidos.');
		}

		const patch = {};

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'nombre')) {
			patch.nombre = normalizeNombre(rawPatch.nombre);
		}

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'email')) {
			patch.email = normalizeEmail(rawPatch.email);
		}

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'telefono')) {
			patch.telefono = normalizeTelefono(rawPatch.telefono);
		}

		if (Object.prototype.hasOwnProperty.call(rawPatch, 'direccion')) {
			patch.direccion = normalizeDireccion(rawPatch.direccion);
		}

		await req.lavadero.update(patch);

		const updated = await Lavadero.findByPk(req.lavaderoId);

		if (!updated) {
			throw createError(404, 'Lavadero no encontrado.');
		}

		res.json(updated);
	} catch (err) {
		next(err);
	}
}

module.exports = { getMe, update };