require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const authService = require('./src/services/authService');

require('./src/models');

const PORT = process.env.PORT || 3000;

async function start() {
	try {
		await sequelize.authenticate();
		console.log('✅ Conectado a PostgreSQL.');

		if (process.env.NODE_ENV === 'development') {
			console.log('🔄 Sincronizando tablas...');
			await sequelize.sync({ alter: true });
			console.log('✅ Tablas sincronizadas.');
		}

		const server = app.listen(PORT, () => {
			console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
			if (process.env.NODE_ENV !== 'production') {
				console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
			}
		});

		// ── Limpieza periódica de refresh tokens ─────────────────────
		const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000;
		setInterval(async () => {
			try {
				await authService.cleanupExpiredTokens();
			} catch (err) {
				console.error('Error en limpieza de tokens:', err.message);
			}
		}, CLEANUP_INTERVAL);

		// ── Graceful shutdown ─────────────────────────────────────────
		async function shutdown(signal) {
			console.log(`\n${signal} recibido — cerrando servidor…`);

			server.close(async () => {
				try {
					await sequelize.close();
					console.log('✅ Conexiones cerradas correctamente.');
				} catch (err) {
					console.error('Error al cerrar la BD:', err.message);
				}
				process.exit(0);
			});

			// Forzar cierre si tarda más de 10 segundos
			setTimeout(() => {
				console.error('❌ Timeout — forzando cierre.');
				process.exit(1);
			}, 10000);
		}

		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));

	} catch (err) {
		console.error('❌ No se pudo iniciar el servidor:', err.message);
		process.exit(1);
	}
}

start();