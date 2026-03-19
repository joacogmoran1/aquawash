const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const rateLimit = require('express-rate-limit');

// ── Rate limiters específicos de auth ────────────────────────
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,              // 10 intentos por IP cada 15 min
	message: { error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true,    // no contar los intentos exitosos
});

const registerLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,       // 1 hora
	max: 5,                     // máx 5 registros por IP por hora
	message: { error: 'Demasiados registros. Intentá de nuevo en 1 hora.' },
	standardHeaders: true,
	legacyHeaders: false,
});

const refreshLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 30,
	message: { error: 'Demasiadas solicitudes.' },
	standardHeaders: true,
	legacyHeaders: false,
});

// ── Rutas ────────────────────────────────────────────────────
router.post('/register',
	registerLimiter,
	[
		body('nombre').trim().notEmpty().withMessage('El nombre es requerido.'),
		body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
		body('password')
			.isLength({ min: 8 })
			.withMessage('La contraseña debe tener al menos 8 caracteres.'),
		body('telefono').optional().trim(),
		body('direccion').optional().trim(),
	],
	validate,
	controller.register
);

router.post('/login',
	loginLimiter,
	[
		body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
		body('password').notEmpty().withMessage('La contraseña es requerida.'),
	],
	validate,
	controller.login
);

// Refresh: usa httpOnly cookie, no necesita body
router.post('/refresh', refreshLimiter, controller.refresh);

// Logout: puede estar autenticado o no (best effort)
router.post('/logout', controller.logout);

router.get('/me', authenticate, controller.me);

module.exports = router;
