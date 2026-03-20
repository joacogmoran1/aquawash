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
		// FIX #1: servicio_id en lugar de servicio_tipo con enum
		body('servicio_id').isUUID().withMessage('servicio_id inválido.'),
		body('turno_id').optional({ checkFalsy: true }).isUUID(),
	],
	validate, controller.crear
);

// FIX #3: /finalizadas ANTES de /:id para que no sea capturada por la ruta dinámica
router.delete('/finalizadas', controller.limpiarFinalizadas);

router.put('/:id', controller.actualizar);
router.post('/:id/avanzar', controller.avanzarEstado);
router.post('/:id/cancelar', controller.cancelarEstado);

module.exports = router;