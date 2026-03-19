const router      = require('express').Router();
const { body }    = require('express-validator');
const controller  = require('../controllers/clienteController');
const validate    = require('../middlewares/validate');

router.get('/',    controller.listar);
router.get('/:id', controller.obtener);
router.get('/:id/historial', controller.historial);

router.post('/',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido.'),
    body('telefono').optional().trim(),
    body('notas').optional().trim(),
  ],
  validate,
  controller.crear
);

router.put('/:id',
  [
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido.'),
  ],
  validate,
  controller.actualizar
);

router.delete('/:id', controller.eliminar);

module.exports = router;
