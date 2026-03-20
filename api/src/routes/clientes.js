const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/clienteController');
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
router.get('/:id/historial', controller.historial);

router.post('/',
  createLimiter,
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido.'),
    body('telefono').optional().trim(),
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