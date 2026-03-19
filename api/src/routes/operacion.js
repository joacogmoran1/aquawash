const router = require('express').Router();
const controller = require('../controllers/operacionController');

router.get('/', controller.obtener);
router.put('/', controller.actualizar);

module.exports = router;
