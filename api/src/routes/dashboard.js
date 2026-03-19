const router = require('express').Router();
const controller = require('../controllers/dashboardController');

router.get('/', controller.getDashboard);
router.get('/semana', controller.getSemana);

module.exports = router;
