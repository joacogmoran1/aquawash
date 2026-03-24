require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const timeout = require('connect-timeout');
const sequelize = require('./config/database');
const logger = require('./utils/logger');

const authenticate = require('./middlewares/authenticate');
const tenantFilter = require('./middlewares/tenantFilter');
const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');       // ← rutas públicas de turnos online
const lavaderoRoutes = require('./routes/lavaderos');
const clienteRoutes = require('./routes/clientes');
const autoRoutes = require('./routes/autos');
const servicioRoutes = require('./routes/servicios');
const turnoRoutes = require('./routes/turnos');
const ordenRoutes = require('./routes/ordenes');
const dashboardRoutes = require('./routes/dashboard');
const operacionRoutes = require('./routes/operacion');

const app = express();

if (process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1);
}

app.use(compression());
app.use(timeout('15s'));

app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", 'data:'],
			connectSrc: ["'self'"],
		},
	},
	crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
	.split(',')
	.map((o) => o.trim());

app.use(cors({
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) callback(null, true);
		else callback(new Error('Origen no permitido por CORS.'));
	},
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	maxAge: 86400,
}));

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
} else {
	app.use(morgan('combined', {
		stream: { write: (msg) => logger.info(msg.trim()) },
		skip: (req) => req.path === '/health',
	}));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiter global
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	message: { error: 'Demasiadas solicitudes. Intentá más tarde.' },
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.path === '/health',
});
app.use(globalLimiter);

// Health check
app.get('/health', async (req, res) => {
	try {
		await sequelize.authenticate();
		res.json({ status: 'ok', db: 'connected', uptime: Math.floor(process.uptime()) });
	} catch (err) {
		logger.error({ err }, 'Health check: DB no disponible');
		res.status(503).json({ status: 'error', db: 'disconnected' });
	}
});

// ── Rutas públicas (sin autenticación) ──────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/public', publicRoutes);   // turnos online para clientes del negocio

// ── Rutas protegidas (requieren JWT) ────────────────────────────────────────
app.use('/clientes', authenticate, tenantFilter(), clienteRoutes);
app.use('/lavaderos', authenticate, tenantFilter(), lavaderoRoutes);
app.use('/autos', authenticate, tenantFilter(), autoRoutes);
app.use('/servicios', authenticate, tenantFilter(), servicioRoutes);
app.use('/turnos', authenticate, tenantFilter(), turnoRoutes);
app.use('/ordenes', authenticate, tenantFilter(), ordenRoutes);
app.use('/dashboard', authenticate, tenantFilter(), dashboardRoutes);
app.use('/operacion', authenticate, tenantFilter(), operacionRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Timeout handler
app.use((req, res, next) => {
	if (req.timedout) return res.status(503).json({ error: 'El servidor tardó demasiado en responder.' });
	next();
});

// Error handler global
app.use(errorHandler);

module.exports = app;