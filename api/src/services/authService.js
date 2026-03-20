const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { Lavadero, RefreshToken } = require('../models');
const { createError } = require('../middlewares/errorHandler');

const ACCESS_TTL = '10m';
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;
const MAX_ACTIVE_TOKENS = 10;

// FIX #2: hash bcrypt real y válido para protección timing attack
// Se genera UNA sola vez al cargar el módulo (síncrono, salt rounds 12).
const FAKE_HASH = bcrypt.hashSync('__aquawash_dummy_placeholder__', 12);

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
	// FIX #15: máximo 10 tokens activos por usuario
	const activeCount = await RefreshToken.count({
		where: {
			lavadero_id: lavaderoId,
			revoked: false,
			expires_at: { [Op.gt]: new Date() },
		},
	});

	if (activeCount >= MAX_ACTIVE_TOKENS) {
		const oldest = await RefreshToken.findOne({
			where: { lavadero_id: lavaderoId, revoked: false, expires_at: { [Op.gt]: new Date() } },
			order: [['created_at', 'ASC']],
		});
		if (oldest) await oldest.update({ revoked: true });
	}

	const plain = crypto.randomBytes(40).toString('hex');
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

async function register({ nombre, direccion, telefono, email, password }) {
	const existing = await Lavadero.findOne({ where: { email } });
	if (existing) throw createError(409, 'No se pudo completar el registro.');

	const password_hash = await bcrypt.hash(password, 12);
	const lavadero = await Lavadero.create({ nombre, direccion, telefono, email, password_hash });
	return Lavadero.findByPk(lavadero.id);
}

async function login({ email, password }) {
	const lavadero = await Lavadero.scope('withPassword').findOne({ where: { email } });

	// FIX #2: FAKE_HASH ahora es un hash bcrypt válido
	const hash = lavadero?.password_hash || FAKE_HASH;
	const valid = await bcrypt.compare(password, hash);

	if (!lavadero || !valid) throw createError(401, 'Credenciales inválidas.');
	return Lavadero.findByPk(lavadero.id);
}

async function rotateRefreshToken(plainToken, ip, userAgent) {
	if (!plainToken) throw createError(401, 'Refresh token no proporcionado.');

	const token_hash = hashToken(plainToken);
	const stored = await RefreshToken.findOne({ where: { token_hash, revoked: false } });

	if (!stored) {
		const anyToken = await RefreshToken.findOne({ where: { token_hash } });
		if (anyToken) {
			await RefreshToken.update({ revoked: true }, { where: { lavadero_id: anyToken.lavadero_id } });
		}
		throw createError(401, 'Sesión inválida. Por favor iniciá sesión nuevamente.');
	}

	if (stored.expires_at < new Date()) {
		await stored.update({ revoked: true });
		throw createError(401, 'Sesión expirada. Por favor iniciá sesión nuevamente.');
	}

	await stored.update({ revoked: true });

	const lavadero = await Lavadero.findByPk(stored.lavadero_id);
	if (!lavadero) throw createError(401, 'Sesión inválida.');

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
	register, login,
	generateAccessToken, issueRefreshToken,
	rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens,
	cleanupExpiredTokens,
};