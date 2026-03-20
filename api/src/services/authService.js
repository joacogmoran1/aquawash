const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Lavadero, Usuario, RefreshToken } = require('../models');
const { createError } = require('../middlewares/errorHandler');

const ACCESS_TTL = '10m';
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;
const MAX_ACTIVE_TOKENS = 10;

const FAKE_HASH = bcrypt.hashSync('__aquawash_dummy_placeholder__', 12);

function generateAccessToken(usuarioId, lavaderoId, rol) {
	return jwt.sign(
		{ usuarioId, lavaderoId, rol },
		process.env.JWT_SECRET,
		{ expiresIn: ACCESS_TTL, issuer: 'washly' }
	);
}

function hashToken(plain) {
	return crypto.createHash('sha256').update(plain).digest('hex');
}

async function issueRefreshToken(usuarioId, ip, userAgent) {
	const activeCount = await RefreshToken.count({
		where: {
			usuario_id: usuarioId,
			revoked: false,
			expires_at: { [Op.gt]: new Date() },
		},
	});

	if (activeCount >= MAX_ACTIVE_TOKENS) {
		const oldest = await RefreshToken.findOne({
			where: { usuario_id: usuarioId, revoked: false, expires_at: { [Op.gt]: new Date() } },
			order: [['created_at', 'ASC']],
		});
		if (oldest) await oldest.update({ revoked: true });
	}

	const plain = crypto.randomBytes(40).toString('hex');
	const token_hash = hashToken(plain);
	const expires_at = new Date(Date.now() + REFRESH_TTL);

	await RefreshToken.create({
		usuario_id: usuarioId,
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
	const existingUsuario = await Usuario.findOne({ where: { email } });
	if (existingUsuario) throw createError(409, 'No se pudo completar el registro.');

	const password_hash = await bcrypt.hash(password, 12);
	const email_verify_token = crypto.randomBytes(32).toString('hex');
	const email_verify_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

	const { lavadero, usuario } = await sequelize.transaction(async (t) => {
		const existing = await Usuario.findOne({ where: { email }, transaction: t });
		if (existing) throw createError(409, 'No se pudo completar el registro.');

		const lavadero = await Lavadero.create(
			{ nombre, direccion, telefono, email },
			{ transaction: t }
		);

		const usuario = await Usuario.create(
			{
				lavadero_id: lavadero.id,
				nombre,
				email,
				password_hash,
				rol: 'owner',
				email_verified: false,
				email_verify_token,
				email_verify_expires,
			},
			{ transaction: t }
		);

		return { lavadero, usuario };
	});

	return { lavadero, usuario, email_verify_token };
}

async function login({ email, password }) {
	const usuario = await Usuario.scope('withPassword').findOne({ where: { email, activo: true } });

	const hash = usuario?.password_hash || FAKE_HASH;
	const valid = await bcrypt.compare(password, hash);

	if (!usuario || !valid) throw createError(401, 'Credenciales inválidas.');

	if (!usuario.email_verified) {
		throw createError(403, 'Debés verificar tu email antes de iniciar sesión. Revisá tu casilla o solicitá un nuevo enlace.');
	}

	const lavadero = await Lavadero.findByPk(usuario.lavadero_id);
	return { usuario, lavadero };
}

async function rotateRefreshToken(plainToken, ip, userAgent) {
	if (!plainToken) throw createError(401, 'Refresh token no proporcionado.');

	const token_hash = hashToken(plainToken);
	const stored = await RefreshToken.findOne({ where: { token_hash, revoked: false } });

	if (!stored) {
		const anyToken = await RefreshToken.findOne({ where: { token_hash } });
		if (anyToken) {
			await RefreshToken.update(
				{ revoked: true },
				{ where: { usuario_id: anyToken.usuario_id } }
			);
		}
		throw createError(401, 'Sesión inválida. Por favor iniciá sesión nuevamente.');
	}

	if (stored.expires_at < new Date()) {
		await stored.update({ revoked: true });
		throw createError(401, 'Sesión expirada. Por favor iniciá sesión nuevamente.');
	}

	await stored.update({ revoked: true });

	const usuario = await Usuario.findByPk(stored.usuario_id);
	if (!usuario || !usuario.activo) throw createError(401, 'Sesión inválida.');

	const lavadero = await Lavadero.findByPk(usuario.lavadero_id);
	const accessToken = generateAccessToken(usuario.id, usuario.lavadero_id, usuario.rol);
	const refreshToken = await issueRefreshToken(usuario.id, ip, userAgent);

	return { lavadero, usuario, accessToken, refreshToken };
}

async function revokeRefreshToken(plainToken) {
	if (!plainToken) return;
	const token_hash = hashToken(plainToken);
	await RefreshToken.update({ revoked: true }, { where: { token_hash } });
}

async function revokeAllUserTokens(usuarioId) {
	await RefreshToken.update(
		{ revoked: true },
		{ where: { usuario_id: usuarioId, revoked: false } }
	);
}

module.exports = {
	register, login,
	generateAccessToken, issueRefreshToken,
	rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens,
	cleanupExpiredTokens,
};