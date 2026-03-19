const authService = require('../services/authService');
const { createError } = require('../middlewares/errorHandler');

// ── Opciones de la cookie ─────────────────────────────────────
// httpOnly  → JS no puede leerla (protección XSS)
// secure    → solo HTTPS en producción
// sameSite  → protección CSRF
// path      → solo se envía a /auth (no a /clientes, /ordenes, etc.)
const COOKIE_NAME = 'refresh_token';
const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict',
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
	path: '/auth',
};

const CLEAR_COOKIE_OPTIONS = {
	...COOKIE_OPTIONS,
	maxAge: 0,
};

// ── Sanitización ─────────────────────────────────────────────
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9+\-() ]+$/;
const LIMITES = { nombre: 120, direccion: 180, telefono: 30, email: 150, password: 200 };

function pick(obj, keys) {
	return keys.reduce((out, k) => {
		if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) out[k] = obj[k];
		return out;
	}, {});
}

function sanitizeText(v) {
	if (typeof v !== 'string') return v;
	return v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function sanitizeEmail(v) {
	if (typeof v !== 'string') return v;
	return v.toLowerCase().replace(/[<>\s]/g, '').trim();
}

function sanitizePhone(v) {
	if (typeof v !== 'string') return v;
	return v.replace(/[^\d+\-() ]/g, '').replace(/\s+/g, ' ').trim();
}

function assertLen(v, max, field) {
	if (v != null && String(v).length > max) throw createError(400, `${field} supera la longitud máxima.`);
}

function normalizeNombre(v) {
	const s = sanitizeText(v);
	if (!s) throw createError(400, 'nombre es requerido.');
	assertLen(s, LIMITES.nombre, 'nombre');
	return s;
}

function normalizeDireccion(v) {
	const s = sanitizeText(v);
	if (!s) throw createError(400, 'direccion es requerida.');
	assertLen(s, LIMITES.direccion, 'direccion');
	return s;
}

function normalizeTelefono(v) {
	const s = sanitizePhone(v);
	if (!s) throw createError(400, 'telefono es requerido.');
	if (!REGEX_TELEFONO.test(s)) throw createError(400, 'telefono inválido.');
	assertLen(s, LIMITES.telefono, 'telefono');
	return s;
}

function normalizeEmail(v) {
	const s = sanitizeEmail(v);
	if (!s) throw createError(400, 'email es requerido.');
	if (!REGEX_EMAIL.test(s)) throw createError(400, 'email inválido.');
	assertLen(s, LIMITES.email, 'email');
	return s;
}

function normalizePassword(v) {
	if (typeof v !== 'string' || !v.trim()) throw createError(400, 'password es requerido.');
	const s = v.trim();
	if (s.length < 8) throw createError(400, 'password debe tener al menos 8 caracteres.');
	assertLen(s, LIMITES.password, 'password');
	return s;
}

// ── Handlers ─────────────────────────────────────────────────

async function register(req, res, next) {
	try {
		const raw = pick(req.body, ['nombre', 'direccion', 'telefono', 'email', 'password']);
		const payload = {
			nombre: normalizeNombre(raw.nombre),
			direccion: normalizeDireccion(raw.direccion),
			telefono: normalizeTelefono(raw.telefono),
			email: normalizeEmail(raw.email),
			password: normalizePassword(raw.password),
		};

		const lavadero = await authService.register(payload);
		const accessToken = authService.generateAccessToken(lavadero.id);
		const refreshToken = await authService.issueRefreshToken(
			lavadero.id, req.ip, req.headers['user-agent']
		);

		res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
		res.status(201).json({ lavadero, accessToken });
	} catch (err) { next(err); }
}

async function login(req, res, next) {
	try {
		const raw = pick(req.body, ['email', 'password']);
		const payload = {
			email: normalizeEmail(raw.email),
			password: normalizePassword(raw.password),
		};

		const lavadero = await authService.login(payload);
		const accessToken = authService.generateAccessToken(lavadero.id);
		const refreshToken = await authService.issueRefreshToken(
			lavadero.id, req.ip, req.headers['user-agent']
		);

		res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
		res.json({ lavadero, accessToken });
	} catch (err) { next(err); }
}

async function refresh(req, res, next) {
	try {
		const plainToken = req.cookies?.[COOKIE_NAME];

		const { lavadero, accessToken, refreshToken } = await authService.rotateRefreshToken(
			plainToken, req.ip, req.headers['user-agent']
		);

		res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
		res.json({ lavadero, accessToken });
	} catch (err) { next(err); }
}

async function logout(req, res, next) {
	try {
		const plainToken = req.cookies?.[COOKIE_NAME];
		await authService.revokeRefreshToken(plainToken);
		res.clearCookie(COOKIE_NAME, CLEAR_COOKIE_OPTIONS);
		res.json({ message: 'Sesión cerrada.' });
	} catch (err) { next(err); }
}

function me(req, res) {
	// req.lavadero ya fue cargado por authenticate.js (defaultScope, sin password_hash)
	res.json({ lavadero: req.lavadero });
}

module.exports = { register, login, refresh, logout, me };
