require('dotenv').config();

const REQUIRED_ENV = ['JWT_SECRET', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

for (const key of REQUIRED_ENV) {
	if (!process.env[key]) {
		console.error(`❌ Variable de entorno requerida faltante: ${key}`);
		process.exit(1);
	}
}

if (process.env.JWT_SECRET.length < 32) {
	console.error('❌ JWT_SECRET debe tener al menos 32 caracteres.');
	console.error('   Generá uno con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
	process.exit(1);
}

// FIX #8: models PRIMERO, antes que authService (que requiere RefreshToken)
require('./src/models');

const app = require('./src/app');
const sequelize = require('./src/config/database');
const authService = require('./src/services/authService');

let logger;
try {
	logger = require('./src/utils/logger');
} catch {
	logger = {
		info: (...a) => console.log('[INFO]', ...a),
		error: (...a) => console.error('[ERROR]', ...a),
		warn: (...a) => console.warn('[WARN]', ...a),
	};
}

const PORT = process.env.PORT || 3000;

async function start() {
	try {
		await sequelize.authenticate();
		logger.info('✅ Conectado a PostgreSQL.');

		if (process.env.NODE_ENV === 'development' && process.env.DB_SYNC === 'true') {
			logger.info('🔄 Sincronizando tablas (development only)…');
			await sequelize.sync({ alter: true });
			logger.info('✅ Tablas sincronizadas.');
		}

		const server = app.listen(PORT, () => {
			logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
			if (process.env.NODE_ENV !== 'production') {
				logger.info(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
				logger.info(`   DB: ${process.env.DB_NAME} @ ${process.env.DB_HOST || 'localhost'}`);
			}
		});

		const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000;
		setInterval(async () => {
			try {
				await authService.cleanupExpiredTokens();
				logger.info('🧹 Limpieza de tokens expirados completada.');
			} catch (err) {
				logger.error('Error en limpieza de tokens:', err.message);
			}
		}, CLEANUP_INTERVAL);

		async function shutdown(signal) {
			logger.info(`\n${signal} recibido — cerrando servidor…`);
			server.close(async () => {
				try {
					await sequelize.close();
					logger.info('✅ Conexiones cerradas correctamente.');
				} catch (err) {
					logger.error('Error al cerrar la BD:', err.message);
				}
				process.exit(0);
			});
			setTimeout(() => {
				logger.error('❌ Timeout en shutdown — forzando cierre.');
				process.exit(1);
			}, 10_000);
		}

		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));

	} catch (err) {
		console.error('❌ No se pudo iniciar el servidor:', err.message);
		process.exit(1);
	}
}

start();