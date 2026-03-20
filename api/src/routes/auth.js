const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const requireRol = require('../middlewares/requireRol');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, max: 10,
	message: { error: 'Demasiados intentos. Intentá en 15 minutos.' },
	standardHeaders: true, legacyHeaders: false, skipSuccessfulRequests: true,
});
const registerLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, max: 5,
	message: { error: 'Demasiados registros. Intentá en 1 hora.' },
	standardHeaders: true, legacyHeaders: false,
});
const refreshLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, max: 30,
	message: { error: 'Demasiadas solicitudes.' },
	standardHeaders: true, legacyHeaders: false,
});
const resetLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, max: 5,
	message: { error: 'Demasiados intentos. Intentá en 1 hora.' },
	standardHeaders: true, legacyHeaders: false,
});

router.post('/register', registerLimiter,
	[
		body('nombre').trim().notEmpty().withMessage('El nombre es requerido.'),
		body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
		body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres.'),
		body('telefono').optional().trim(),
		body('direccion').optional().trim(),
	],
	validate, controller.register
);

router.post('/login', loginLimiter,
	[
		body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
		body('password').notEmpty().withMessage('La contraseña es requerida.'),
	],
	validate, controller.login
);

router.post('/refresh', refreshLimiter, controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

router.get('/verify-email', controller.verifyEmail);
router.post('/resend-verification', resetLimiter, controller.resendVerification);

router.post('/forgot-password', resetLimiter,
	[body('email').isEmail().withMessage('Email inválido.')],
	validate, controller.forgotPassword
);
router.post('/reset-password', resetLimiter,
	[
		body('token').notEmpty().withMessage('Token requerido.'),
		body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres.'),
	],
	validate, controller.resetPassword
);

// ── Gestión del equipo (solo owners y admins) ──────────────────
router.get('/equipo',
	authenticate, requireRol('owner', 'admin'),
	controller.listarUsuarios
);

router.post('/equipo',
	authenticate, requireRol('owner', 'admin'),
	[
		body('nombre').trim().notEmpty().withMessage('Nombre requerido.'),
		body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
		body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres.'),
		body('rol').isIn(['admin', 'operario']).withMessage('Rol inválido.'),
	],
	validate, controller.crearUsuario
);

router.put('/equipo/:id',
	authenticate, requireRol('owner', 'admin'),
	[
		body('nombre').optional().trim().notEmpty(),
		body('rol').optional().isIn(['admin', 'operario']),
		body('activo').optional().isBoolean(),
	],
	validate, controller.actualizarUsuario
);

router.delete('/equipo/:id',
	authenticate, requireRol('owner'),
	controller.eliminarUsuario
);

// Eliminar cuenta (requiere autenticación + contraseña de confirmación)
router.delete('/account',
	authenticate,
	[body('password').notEmpty().withMessage('La contraseña es requerida.')],
	validate,
	controller.deleteAccount
);

module.exports = router;