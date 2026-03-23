const crypto = require('crypto');
const bcrypt = require('bcrypt');
const authService = require('../services/authService');
const { createError } = require('../middlewares/errorHandler');
const { Lavadero, Usuario } = require('../models');

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

// Helper para construir el objeto lavadero con email_verified del usuario
function buildLavaderoResponse(lavadero, usuario) {
	return {
		...lavadero.toJSON(),
		email_verified: usuario.email_verified,
	};
}

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

		const { lavadero, email_verify_token } = await authService.register(payload);

		if (emailService && email_verify_token) {
			try {
				await emailService.sendVerificationEmail(lavadero.email, lavadero.nombre, email_verify_token);
			} catch (e) {
				console.error('Error enviando email de verificación:', e.message);
			}
		}

		res.status(201).json({
			message: 'Cuenta creada. Revisá tu email para verificarla antes de iniciar sesión.',
		});
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
		res.json({
			lavadero: buildLavaderoResponse(lavadero, usuario),
			usuario,
			accessToken,
		});
	} catch (err) { next(err); }
}

async function refresh(req, res, next) {
	try {
		const { lavadero, usuario, accessToken, refreshToken } = await authService.rotateRefreshToken(
			req.cookies?.[COOKIE_NAME], req.ip, req.headers['user-agent']
		);
		res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTS);
		res.json({
			lavadero: buildLavaderoResponse(lavadero, usuario),
			accessToken,
		});
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

async function verifyEmail(req, res, next) {
	try {
		const { token } = req.query;
		if (!token || typeof token !== 'string') throw createError(400, 'Token inválido.');

		const usuario = await Usuario.unscoped().findOne({
			where: { email_verify_token: token },
		});

		if (!usuario) throw createError(400, 'Token inválido o expirado.');

		// Doble llamada (StrictMode, scanner de Gmail) — retornar éxito igual
		if (usuario.email_verified) return res.json({ message: 'Email ya verificado.' });

		if (usuario.email_verify_expires < new Date()) {
			throw createError(400, 'El token de verificación expiró.');
		}

		// No nullear el token: llamadas concurrentes con el mismo token
		// también encuentran al usuario y retornan éxito.
		await usuario.update({ email_verified: true });

		res.json({ message: 'Email verificado correctamente.' });
	} catch (err) { next(err); }
}

async function resendVerification(req, res, next) {
	try {
		const email = sanEmail(req.body.email || '');
		if (!email) throw createError(400, 'email es requerido.');

		const MSG = 'Si el email existe y no está verificado, recibirás un enlace.';

		const usuario = await Usuario.unscoped().findOne({ where: { email, rol: 'owner' } });

		if (usuario && !usuario.email_verified && emailService) {
			const token = crypto.randomBytes(32).toString('hex');
			const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
			await usuario.update({ email_verify_token: token, email_verify_expires: expires });
			try {
				await emailService.sendVerificationEmail(usuario.email, usuario.nombre, token);
			} catch (e) {
				console.error('Error reenviando verificación:', e.message);
			}
		}

		res.json({ message: MSG });
	} catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
	try {
		const email = sanEmail(req.body.email || '');
		if (!email) throw createError(400, 'email es requerido.');

		const MSG = 'Si el email existe, recibirás las instrucciones.';

		const usuario = await Usuario.unscoped().findOne({ where: { email } });
		if (usuario && emailService) {
			const token = crypto.randomBytes(32).toString('hex');
			const expires = new Date(Date.now() + 60 * 60 * 1000);
			await usuario.update({ reset_password_token: token, reset_password_expires: expires });
			try {
				const lavadero = await Lavadero.findByPk(usuario.lavadero_id);
				await emailService.sendPasswordResetEmail(usuario.email, lavadero?.nombre || usuario.nombre, token);
			} catch (e) {
				console.error('Error enviando email de recuperación:', e.message);
			}
		}

		res.json({ message: MSG });
	} catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
	try {
		const { token, password } = req.body;
		if (!token || typeof token !== 'string') throw createError(400, 'Token inválido.');
		const safePass = normalizePassword(password);

		const usuario = await Usuario.unscoped().findOne({
			where: { reset_password_token: token },
		});
		if (!usuario) throw createError(400, 'Token inválido o expirado.');
		if (usuario.reset_password_expires < new Date()) throw createError(400, 'El token expiró. Solicitá uno nuevo.');

		const password_hash = await bcrypt.hash(safePass, 12);
		await usuario.update({
			password_hash,
			reset_password_token: null,
			reset_password_expires: null,
		});
		await authService.revokeAllUserTokens(usuario.id);

		res.json({ message: 'Contraseña actualizada. Iniciá sesión nuevamente.' });
	} catch (err) { next(err); }
}

async function listarUsuarios(req, res, next) {
	try {
		const usuarios = await Usuario.findAll({
			where: { lavadero_id: req.lavaderoId },
			order: [['nombre', 'ASC']],
		});
		res.json(usuarios);
	} catch (err) { next(err); }
}

async function crearUsuario(req, res, next) {
	try {
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
			email_verified: true,
		});

		res.status(201).json(usuario);
	} catch (err) { next(err); }
}

async function actualizarUsuario(req, res, next) {
	try {
		const usuario = await Usuario.findOne({
			where: { id: req.params.id, lavadero_id: req.lavaderoId },
		});
		if (!usuario) throw createError(404, 'Usuario no encontrado.');

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

async function deleteAccount(req, res, next) {
	try {
		const { password } = req.body;
		if (!password) throw createError(400, 'La contraseña es requerida para confirmar.');

		const usuario = await Usuario.unscoped().findOne({
			where: { id: req.usuario.id, rol: 'owner' },
		});
		if (!usuario) throw createError(404, 'Usuario no encontrado.');

		const valid = await bcrypt.compare(password, usuario.password_hash);
		if (!valid) throw createError(401, 'Contraseña incorrecta.');

		const lavadero = await Lavadero.findByPk(req.lavaderoId);
		if (!lavadero) throw createError(404, 'Lavadero no encontrado.');
		await lavadero.destroy();

		res.json({ message: 'Cuenta eliminada correctamente.' });
	} catch (err) { next(err); }
}

module.exports = {
	register, login, refresh, logout, me,
	verifyEmail, resendVerification,
	forgotPassword, resetPassword,
	listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario,
	deleteAccount,
};