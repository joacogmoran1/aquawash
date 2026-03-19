const { Lavadero, Servicio } = require('../models');
const { createError } = require('../middlewares/errorHandler');

const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const HORARIO_COLS = DIAS.flatMap((d) => [`${d}_apertura`, `${d}_cierre`]);

const CAMPOS_LAVADERO = [
	'nombre',
	'email',
	'telefono',
	'direccion',
	...DIAS,
	...HORARIO_COLS,
];

const CAMPOS_TEXTO = ['nombre', 'email', 'telefono', 'direccion'];

const REGEX_HORA = /^\d{2}:\d{2}$/;
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

function sanitizeNullableText(value) {
	if (value == null) return null;
	const sanitized = sanitizeText(value);
	return sanitized === '' ? null : sanitized;
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

function normalizeDayFlag(value, fieldName) {
	if (value === 1 || value === '1' || value === true) return 1;
	if (value === 0 || value === '0' || value === false) return 0;
	throw createError(400, `${fieldName} debe ser 0 o 1.`);
}

function normalizeTime(value, fieldName) {
	const sanitized = sanitizeNullableText(value);

	if (sanitized === null) return null;

	if (!REGEX_HORA.test(sanitized)) {
		throw createError(400, `${fieldName} debe tener formato HH:MM.`);
	}

	return sanitized;
}

function normalizeNombre(value) {
	const nombre = sanitizeNullableText(value);
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
	const direccion = sanitizeNullableText(value);
	if (!direccion) throw createError(400, 'direccion es requerida.');
	assertMaxLength(direccion, LIMITES.direccion, 'direccion');
	return direccion;
}

async function obtener(req, res, next) {
	try {
		const lavadero = await Lavadero.findByPk(req.lavaderoId, {
			attributes: CAMPOS_LAVADERO,
			include: [
				{
					model: Servicio,
					where: { activo: true },
					required: false,
					attributes: [
						'id', 'nombre', 'precio', 'duracion_estimada_min',
						'capacidad_por_hora', 'tipo', 'activo'
					],
				},
			],
		});

		if (!lavadero) {
			throw createError(404, 'Lavadero no encontrado.');
		}

		res.json(lavadero);
	} catch (err) {
		next(err);
	}
}

async function actualizar(req, res, next) {
	try {
		const rawPatch = pick(req.body, CAMPOS_LAVADERO);

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

		for (const dia of DIAS) {
			if (Object.prototype.hasOwnProperty.call(rawPatch, dia)) {
				patch[dia] = normalizeDayFlag(rawPatch[dia], dia);
			}
		}

		for (const dia of DIAS) {
			const aperturaKey = `${dia}_apertura`;
			const cierreKey = `${dia}_cierre`;

			if (Object.prototype.hasOwnProperty.call(rawPatch, aperturaKey)) {
				patch[aperturaKey] = normalizeTime(rawPatch[aperturaKey], aperturaKey);
			}

			if (Object.prototype.hasOwnProperty.call(rawPatch, cierreKey)) {
				patch[cierreKey] = normalizeTime(rawPatch[cierreKey], cierreKey);
			}
		}

		const lavadero = await Lavadero.findByPk(req.lavaderoId);

		if (!lavadero) {
			throw createError(404, 'Lavadero no encontrado.');
		}

		for (const dia of DIAS) {
			const aperturaKey = `${dia}_apertura`;
			const cierreKey = `${dia}_cierre`;

			const diaActual = Object.prototype.hasOwnProperty.call(patch, dia)
				? patch[dia]
				: lavadero[dia];

			const aperturaActual = Object.prototype.hasOwnProperty.call(patch, aperturaKey)
				? patch[aperturaKey]
				: lavadero[aperturaKey];

			const cierreActual = Object.prototype.hasOwnProperty.call(patch, cierreKey)
				? patch[cierreKey]
				: lavadero[cierreKey];

			if (diaActual === 0) {
				if (Object.prototype.hasOwnProperty.call(patch, dia) ||
					Object.prototype.hasOwnProperty.call(patch, aperturaKey) ||
					Object.prototype.hasOwnProperty.call(patch, cierreKey)) {
					patch[aperturaKey] = null;
					patch[cierreKey] = null;
				}
				continue;
			}

			const tocaApertura = Object.prototype.hasOwnProperty.call(patch, aperturaKey);
			const tocaCierre = Object.prototype.hasOwnProperty.call(patch, cierreKey);
			const tocaDia = Object.prototype.hasOwnProperty.call(patch, dia);

			if (tocaApertura !== tocaCierre) {
				throw createError(400, `Debés enviar ${aperturaKey} y ${cierreKey} juntos.`);
			}

			if (tocaDia && diaActual === 1 && (!aperturaActual || !cierreActual)) {
				throw createError(400, `${dia} abierto requiere hora de apertura y cierre.`);
			}

			if (aperturaActual && cierreActual && aperturaActual >= cierreActual) {
				throw createError(400, `En ${dia}, la hora de apertura debe ser menor a la de cierre.`);
			}
		}

		await lavadero.update(patch);

		const updated = await Lavadero.findByPk(req.lavaderoId, {
			attributes: CAMPOS_LAVADERO,
			include: [
				{
					model: Servicio,
					where: { activo: true },
					required: false,
					attributes: [
						'id', 'nombre', 'precio', 'duracion_estimada_min',
						'capacidad_por_hora', 'tipo', 'activo'
					],
				},
			],
		});

		res.json(updated);
	} catch (err) {
		next(err);
	}
}

module.exports = { obtener, actualizar };