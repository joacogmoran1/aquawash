const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/servicioController');
const validate = require('../middlewares/validate');
const { Servicio } = require('../models');

const createLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 60,
	message: { error: 'Demasiadas creaciones. Intentá más tarde.' },
	standardHeaders: true,
	legacyHeaders: false,
});

const MAX_SERVICIOS = 20;

async function checkServiceLimit(req, res, next) {
	try {
		const count = await Servicio.count({
			where: { lavadero_id: req.lavaderoId, activo: true },
		});
		if (count >= MAX_SERVICIOS) {
			return res.status(422).json({
				error: `Límite de servicios alcanzado (máximo ${MAX_SERVICIOS}).`,
			});
		}
		next();
	} catch (err) { next(err); }
}

router.get('/', controller.listar);

router.post('/',
	createLimiter,
	checkServiceLimit,
	[
		body('nombre').trim().notEmpty().withMessage('El nombre es requerido.'),
		body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo.'),
		body('duracion_estimada_min').optional().isInt({ min: 1 }),
		body('capacidad_por_hora').optional().isInt({ min: 1 }),
	],
	validate,
	controller.crear
);

router.put('/:id',
	[
		body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
		body('precio').optional().isFloat({ min: 0 }),
		body('duracion_estimada_min').optional().isInt({ min: 1 }),
		body('capacidad_por_hora').optional().isInt({ min: 1 }),
		body('activo').optional().isBoolean(),
	],
	validate,
	controller.actualizar
);

router.delete('/:id', controller.eliminar);

module.exports = router;