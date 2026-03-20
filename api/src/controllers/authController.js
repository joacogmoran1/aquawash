const crypto = require('crypto');
const bcrypt = require('bcrypt');
const authService = require('../services/authService');
const { createError } = require('../middlewares/errorHandler');
const { Lavadero, Usuario } = require('../models');

// emailService es opcional: si no hay SMTP configurado, el registro igual funciona
let emailService = null;
try { emailService = require('../utils/emailService'); } catch { }

const COOKIE_NAME = 'refresh_token';
const COOKIE_OPTS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict',
	maxAge: 7 * 24 * 60 * 60 * 1000,
	path: '/auth',
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9+\-() ]+$/;
const LIMITES = { nombre: 120, direccion: 180, telefono: 30, email: 150, password: 200 };

function pick(obj, keys) {
	return keys.reduce((o, k) => {
		if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) o[k] = obj[k];
		return o;
	}, {});
}

const san = (v) => typeof v !== 'string' ? v : v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
const sanEmail = (v) => typeof v !== 'string' ? v : v.toLowerCase().replace(/[<>\s]/g, '').trim();
const sanPhone = (v) => typeof v !== 'string' ? v : v.replace(/[^\d+\-() ]/g, '').replace(/\s+/g, ' ').trim();

function assertLen(v, max, f) {
	if (v != null && String(v).length > max) throw createError(400, `${f} supera la longitud máxima.`);
}

const normalizeNombre = (v) => { const s = san(v); if (!s) throw createError(400, 'nombre es requerido.'); assertLen(s, LIMITES.nombre, 'nombre'); return s; };
const normalizeDireccion = (v) => { const s = san(v); if (!s) throw createError(400, 'direccion es requerida.'); assertLen(s, LIMITES.direccion, 'direccion'); return s; };
const normalizeTelefono = (v) => { const s = sanPhone(v); if (!s) throw createError(400, 'telefono es requerido.'); if (!REGEX_TELEFONO.test(s)) throw createError(400, 'telefono inválido.'); assertLen(s, LIMITES.telefono, 'telefono'); return s; };
const normalizeEmail = (v) => { const s = sanEmail(v); if (!s) throw createError(400, 'email es requerido.'); if (!REGEX_EMAIL.test(s)) throw createError(400, 'email inválido.'); assertLen(s, LIMITES.email, 'email'); return s; };
const normalizePassword = (v) => {
	if (typeof v !== 'string' || !v.trim()) throw createError(400, 'password es requerido.');
	const s = v.trim();
	if (s.length < 8) throw createError(400, 'password debe tener al menos 8 caracteres.');
	assertLen(s, LIMITES.password, 'password');
	return s;
};


// Login
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

		const { lavadero, usuario } = await authService.register(payload);

		const accessToken = authService.generateAccessToken(usuario.id, lavadero.id, usuario.rol);
		const refreshToken = await authService.issueRefreshToken(usuario.id, req.ip, req.headers['user-agent']);
		res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTS);
		res.status(201).json({ lavadero, usuario, accessToken });
	} catch (err) { next(err); }
}

async function login(req, res, next) {
	try {
		const raw = pick(req.body, ['email', 'password']);
		const { lavadero, usuario } = await authService.login({
			email: normalizeEmail(raw.email),
			password: normalizePassword(raw.password),
		});
		const accessToken = authService.generateAccessToken(usuario.id, lavadero.id, usuario.rol);
		const refreshToken = await authService.issueRefreshToken(usuario.id, req.ip, req.headers['user-agent']);
		res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTS);
		res.json({ lavadero, usuario, accessToken });
	} catch (err) { next(err); }
}

async function refresh(req, res, next) {
	try {
		const { lavadero, accessToken, refreshToken } = await authService.rotateRefreshToken(
			req.cookies?.[COOKIE_NAME], req.ip, req.headers['user-agent']
		);
		res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTS);
		res.json({ lavadero, accessToken });
	} catch (err) { next(err); }
}

async function logout(req, res, next) {
	try {
		await authService.revokeRefreshToken(req.cookies?.[COOKIE_NAME]);
		res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTS, maxAge: 0 });
		res.json({ message: 'Sesión cerrada.' });
	} catch (err) { next(err); }
}

function me(req, res) {
	res.json({ lavadero: req.lavadero, usuario: req.usuario, rol: req.rol });
}

// Email & Password
async function verifyEmail(req, res, next) {
	try {
		const { token } = req.query;
		if (!token || typeof token !== 'string') throw createError(400, 'Token inválido.');

		const lav = await Lavadero.scope('withPassword').findOne({
			where: { email_verify_token: token },
		});
		if (!lav) throw createError(400, 'Token inválido o expirado.');
		if (lav.email_verified) return res.json({ message: 'Email ya verificado.' });
		if (lav.email_verify_expires < new Date()) throw createError(400, 'El token de verificación expiró.');

		await lav.update({ email_verified: true, email_verify_token: null, email_verify_expires: null });
		res.json({ message: 'Email verificado correctamente.' });
	} catch (err) { next(err); }
}

async function resendVerification(req, res, next) {
	try {
		const email = sanEmail(req.body.email || '');
		if (!email) throw createError(400, 'email es requerido.');

		const lav = await Lavadero.findOne({ where: { email } });
		const MSG = 'Si el email existe y no está verificado, recibirás un enlace.';

		if (lav && !lav.email_verified && emailService) {
			const token = crypto.randomBytes(32).toString('hex');
			const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
			await lav.update({ email_verify_token: token, email_verify_expires: expires });
			await emailService.sendVerificationEmail(lav.email, lav.nombre, token);
		}

		res.json({ message: MSG });
	} catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
	try {
		const email = sanEmail(req.body.email || '');
		if (!email) throw createError(400, 'email es requerido.');

		const lav = await Lavadero.findOne({ where: { email } });
		const MSG = 'Si el email existe, recibirás las instrucciones.';

		if (lav && emailService) {
			const token = crypto.randomBytes(32).toString('hex');
			const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
			await lav.update({ reset_password_token: token, reset_password_expires: expires });
			await emailService.sendPasswordResetEmail(lav.email, lav.nombre, token);
		}

		res.json({ message: MSG });
	} catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
	try {
		const { token, password } = req.body;
		if (!token || typeof token !== 'string') throw createError(400, 'Token inválido.');
		const safePass = normalizePassword(password);

		const lav = await Lavadero.scope('withPassword').findOne({
			where: { reset_password_token: token },
		});
		if (!lav) throw createError(400, 'Token inválido o expirado.');
		if (lav.reset_password_expires < new Date()) throw createError(400, 'El token expiró. Solicitá uno nuevo.');

		const password_hash = await bcrypt.hash(safePass, 12);
		await lav.update({ password_hash, reset_password_token: null, reset_password_expires: null });
		const owner = await Usuario.findOne({ where: { lavadero_id: lav.id, rol: 'owner' } });
		if (owner) {
			await owner.update({ password_hash });
			await authService.revokeAllUserTokens(owner.id); // ← ID correcto
		}

		res.json({ message: 'Contraseña actualizada. Iniciá sesión nuevamente.' });
	} catch (err) { next(err); }
}

// Users
async function listarUsuarios(req, res, next) {
	try {
		const { Usuario } = require('../models');
		const usuarios = await Usuario.findAll({
			where: { lavadero_id: req.lavaderoId },
			order: [['nombre', 'ASC']],
		});
		res.json(usuarios);
	} catch (err) { next(err); }
}

async function crearUsuario(req, res, next) {
	try {
		const bcrypt = require('bcrypt');
		const { Usuario } = require('../models');
		const raw = pick(req.body, ['nombre', 'email', 'password', 'rol']);

		const existing = await Usuario.findOne({ where: { email: raw.email } });
		if (existing) throw createError(409, 'El email ya está en uso.');

		const password_hash = await bcrypt.hash(normalizePassword(raw.password), 12);
		const usuario = await Usuario.create({
			lavadero_id: req.lavaderoId,
			nombre: normalizeNombre(raw.nombre),
			email: normalizeEmail(raw.email),
			password_hash,
			rol: raw.rol,
		});

		res.status(201).json(usuario);
	} catch (err) { next(err); }
}

async function actualizarUsuario(req, res, next) {
	try {
		const { Usuario } = require('../models');
		const usuario = await Usuario.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!usuario) throw createError(404, 'Usuario no encontrado.');

		// Los owners no pueden ser degradados por admins
		if (usuario.rol === 'owner' && req.rol !== 'owner')
			throw createError(403, 'No podés modificar al owner.');

		const patch = pick(req.body, ['nombre', 'rol', 'activo']);
		if (patch.nombre) patch.nombre = normalizeNombre(patch.nombre);
		if (patch.rol && patch.rol === 'owner') throw createError(400, 'No se puede asignar el rol owner.');

		await usuario.update(patch);
		res.json(usuario);
	} catch (err) { next(err); }
}

async function eliminarUsuario(req, res, next) {
	try {
		const { Usuario } = require('../models');
		const usuario = await Usuario.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!usuario) throw createError(404, 'Usuario no encontrado.');
		if (usuario.rol === 'owner') throw createError(400, 'No se puede eliminar al owner.');
		if (usuario.id === req.usuario.id) throw createError(400, 'No podés eliminarte a vos mismo.');

		await authService.revokeAllUserTokens(usuario.id);
		await usuario.destroy();
		res.status(204).send();
	} catch (err) { next(err); }
}

module.exports = {
	register, login, refresh, logout, me,
	verifyEmail, resendVerification,
	forgotPassword, resetPassword,
	listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario,
};