require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const timeout = require('connect-timeout');

const authenticate = require('./middlewares/authenticate');
const { errorHandler } = require('./middlewares/errorHandler');

// Rutas
const authRoutes = require('./routes/auth');
const lavaderoRoutes = require('./routes/lavaderos');
const clienteRoutes = require('./routes/clientes');
const autoRoutes = require('./routes/autos');
const servicioRoutes = require('./routes/servicios');
const turnoRoutes = require('./routes/turnos');
const ordenRoutes = require('./routes/ordenes');
const dashboardRoutes = require('./routes/dashboard');
const operacionRoutes = require('./routes/operacion');

const app = express();

// ── Trust proxy ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1);
}

// ── Compresión ────────────────────────────────────────────────
app.use(compression());

// ── Timeout ───────────────────────────────────────────────────
app.use(timeout('15s'));

// ── Security headers ──────────────────────────────────────────
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

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
	.split(',')
	.map(o => o.trim());

app.use(cors({
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Origen no permitido por CORS.'));
		}
	},
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	maxAge: 86400,
}));

// ── Cookie parser ─────────────────────────────────────────────
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// ── Body limit ────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Rate limiter global ───────────────────────────────────────
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	message: { error: 'Demasiadas solicitudes. Intentá más tarde.' },
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.path === '/health',
});
app.use(globalLimiter);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Rutas públicas ────────────────────────────────────────────
app.use('/auth', authRoutes);

// ── Rutas protegidas ──────────────────────────────────────────
app.use('/clientes', authenticate, clienteRoutes);
app.use('/lavaderos', authenticate, lavaderoRoutes);
app.use('/autos', authenticate, autoRoutes);
app.use('/servicios', authenticate, servicioRoutes);
app.use('/turnos', authenticate, turnoRoutes);
app.use('/ordenes', authenticate, ordenRoutes);
app.use('/dashboard', authenticate, dashboardRoutes);
app.use('/operacion', authenticate, operacionRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// ── Timeout handler ───────────────────────────────────────────
app.use((req, res, next) => {
	if (req.timedout) {
		return res.status(503).json({ error: 'El servidor tardó demasiado en responder.' });
	}
	next();
});

// ── Error handler global ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;