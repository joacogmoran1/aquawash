const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/servicioController');
const validate = require('../middlewares/validate');

router.get('/', controller.listar);

router.post('/',
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
		body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo.'),
		body('duracion_estimada_min').optional().isInt({ min: 1 }),
		body('capacidad_por_hora').optional().isInt({ min: 1 }),
		body('activo').optional().isBoolean(),
	],
	validate,
	controller.actualizar
);

router.delete('/:id', controller.eliminar);

module.exports = router;