const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { Lavadero, RefreshToken } = require('../models');
const { createError } = require('../middlewares/errorHandler');

// ── Constantes ───────────────────────────────────────────────
const ACCESS_TTL = '10m';
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

// ── Helpers internos ─────────────────────────────────────────

function generateAccessToken(lavaderoId) {
	return jwt.sign(
		{ lavaderoId },
		process.env.JWT_SECRET,
		{ expiresIn: ACCESS_TTL, issuer: 'washly' }
	);
}

function hashToken(plain) {
	return crypto.createHash('sha256').update(plain).digest('hex');
}

async function issueRefreshToken(lavaderoId, ip, userAgent) {
	const plain = crypto.randomBytes(40).toString('hex'); // 80 chars hex
	const token_hash = hashToken(plain);
	const expires_at = new Date(Date.now() + REFRESH_TTL);

	await RefreshToken.create({
		lavadero_id: lavaderoId,
		token_hash,
		expires_at,
		ip: ip || null,
		user_agent: userAgent ? userAgent.slice(0, 500) : null,
	});

	return plain;
}

// Eliminar tokens expirados (llamar periódicamente desde server.js)
async function cleanupExpiredTokens() {
	await RefreshToken.destroy({
		where: {
			[Op.or]: [
				{ expires_at: { [Op.lt]: new Date() } },
				{ revoked: true },
			],
		},
	});
}

// ── Servicios públicos ───────────────────────────────────────

async function register({ nombre, direccion, telefono, email, password }) {
	const existing = await Lavadero.findOne({ where: { email } });
	// Mismo mensaje para email existente o no → evitar enumeración de usuarios
	if (existing) throw createError(409, 'No se pudo completar el registro.');

	const password_hash = await bcrypt.hash(password, 12);
	const lavadero = await Lavadero.create({
		nombre, direccion, telefono, email, password_hash,
	});

	// Recargar sin password_hash (defaultScope lo excluye)
	return Lavadero.findByPk(lavadero.id);
}

async function login({ email, password }) {
	// withPassword scope devuelve todos los campos incluyendo password_hash
	const lavadero = await Lavadero.scope('withPassword').findOne({ where: { email } });

	// Siempre ejecutar bcrypt aunque no exista el usuario → prevenir timing attacks
	const fakeHash = '$2b$12$invalidhashtopreventtimingattack000000000000000000000000';
	const hash = lavadero?.password_hash || fakeHash;
	const valid = await bcrypt.compare(password, hash);

	if (!lavadero || !valid) {
		// Mismo mensaje para usuario no existe y contraseña incorrecta → evitar enumeración
		throw createError(401, 'Credenciales inválidas.');
	}

	// Devolver sin password_hash
	return Lavadero.findByPk(lavadero.id);
}

async function rotateRefreshToken(plainToken, ip, userAgent) {
	if (!plainToken) throw createError(401, 'Refresh token no proporcionado.');

	const token_hash = hashToken(plainToken);

	const stored = await RefreshToken.findOne({
		where: { token_hash, revoked: false },
	});

	if (!stored) {
		// Token no encontrado o ya revocado → posible token theft
		// Revocar TODOS los tokens del usuario si el hash existe pero está revocado
		const anyToken = await RefreshToken.findOne({ where: { token_hash } });
		if (anyToken) {
			// Token reusado → posible ataque, revocar toda la familia
			await RefreshToken.update(
				{ revoked: true },
				{ where: { lavadero_id: anyToken.lavadero_id } }
			);
		}
		throw createError(401, 'Sesión inválida. Por favor iniciá sesión nuevamente.');
	}

	if (stored.expires_at < new Date()) {
		await stored.update({ revoked: true });
		throw createError(401, 'Sesión expirada. Por favor iniciá sesión nuevamente.');
	}

	// Revocar el token usado (rotación)
	await stored.update({ revoked: true });

	const lavadero = await Lavadero.findByPk(stored.lavadero_id);
	if (!lavadero) throw createError(401, 'Sesión inválida.');

	// Emitir nuevos tokens
	const accessToken = generateAccessToken(lavadero.id);
	const refreshToken = await issueRefreshToken(lavadero.id, ip, userAgent);

	return { lavadero, accessToken, refreshToken };
}

async function revokeRefreshToken(plainToken) {
	if (!plainToken) return;
	const token_hash = hashToken(plainToken);
	await RefreshToken.update({ revoked: true }, { where: { token_hash } });
}

async function revokeAllUserTokens(lavaderoId) {
	await RefreshToken.update(
		{ revoked: true },
		{ where: { lavadero_id: lavaderoId, revoked: false } }
	);
}

module.exports = {
	register,
	login,
	generateAccessToken,
	issueRefreshToken,
	rotateRefreshToken,
	revokeRefreshToken,
	revokeAllUserTokens,
	cleanupExpiredTokens,
};
