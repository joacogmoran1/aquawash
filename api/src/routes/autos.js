const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/autoController');
const validate   = require('../middlewares/validate');

router.get('/',    controller.listar);
router.get('/:id', controller.obtener);

router.post('/',
  [
    body('cliente_id').isUUID().withMessage('cliente_id inválido.'),
    body('marca').trim().notEmpty().withMessage('La marca es requerida.'),
    body('modelo').trim().notEmpty().withMessage('El modelo es requerido.'),
    body('patente').trim().notEmpty().withMessage('La patente es requerida.'),
    body('color').optional().trim(),
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Año inválido.'),
  ],
  validate,
  controller.crear
);

router.put('/:id',
  [
    body('marca').optional().trim().notEmpty(),
    body('modelo').optional().trim().notEmpty(),
    body('patente').optional().trim().notEmpty(),
    body('color').optional().trim(),
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  ],
  validate,
  controller.actualizar
);

router.delete('/:id', controller.eliminar);

module.exports = router;
