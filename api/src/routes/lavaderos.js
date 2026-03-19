const router     = require('express').Router();
const { body }   = require('express-validator');
const controller = require('../controllers/lavaderoController');
const validate   = require('../middlewares/validate');

router.get('/me', controller.getMe);

router.put('/:id',
  [
    body('nombre').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('telefono').optional().trim(),
    body('direccion').optional().trim(),
  ],
  validate,
  controller.update
);

module.exports = router;
