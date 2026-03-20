const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/turnoController');
const validate = require('../middlewares/validate');

const createLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 60,
	message: { error: 'Demasiadas creaciones. Intentá más tarde.' },
	standardHeaders: true,
	legacyHeaders: false,
});

router.get('/', controller.listar);
router.get('/:id', controller.obtener);

router.post('/',
	createLimiter,
	[
		body('cliente_id').isUUID().withMessage('cliente_id inválido.'),
		body('auto_id').isUUID().withMessage('auto_id inválido.'),
		body('servicio_id').isUUID().withMessage('servicio_id inválido.'),
		body('fecha').isDate().withMessage('Fecha inválida. Formato: YYYY-MM-DD.'),
		body('hora').matches(/^\d{2}:\d{2}$/).withMessage('Hora inválida. Formato: HH:MM.'),
		body('estado').optional().isIn(['reservado', 'confirmado']),
	],
	validate,
	controller.crear
);

router.put('/:id',
	[
		body('fecha').optional().isDate(),
		body('hora').optional().matches(/^\d{2}:\d{2}$/),
		body('estado').optional().isIn(['reservado', 'confirmado', 'cancelado', 'completado']),
	],
	validate,
	controller.actualizar
);

router.delete('/:id', controller.eliminar);

module.exports = router;