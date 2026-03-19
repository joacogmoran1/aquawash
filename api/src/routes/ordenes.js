const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/ordenController');
const validate = require('../middlewares/validate');

router.get('/', controller.listar);
router.get('/:id', controller.obtener);

router.post('/',
	[
		body('cliente_id').isUUID().withMessage('cliente_id inválido.'),
		body('auto_id').isUUID().withMessage('auto_id inválido.'),
		body('servicio_tipo')
			.isIn(['exterior', 'completo', 'detailing'])
			.withMessage("servicio_tipo debe ser 'exterior', 'completo' o 'detailing'."),
		body('turno_id').optional({ checkFalsy: true }).isUUID(),
		body('notas').optional().trim(),
	],
	validate,
	controller.crear
);

router.put('/:id', [ body('notas').optional().trim(), ], validate, controller.actualizar);

// Avanzar estado: esperando → lavando → listo → entregado
router.post('/:id/avanzar', controller.avanzarEstado);
router.post('/:id/cancelar', controller.cancelarEstado);
router.delete('/finalizadas', controller.limpiarFinalizadas);

module.exports = router;
