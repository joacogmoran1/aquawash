'use strict';

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/publicController');

const infoLimiter = rateLimit({
    windowMs: 60 * 1000, max: 40,
    message: { error: 'Demasiadas solicitudes. Intentá en un momento.' },
    standardHeaders: true, legacyHeaders: false,
});

const slotsLimiter = rateLimit({
    windowMs: 60 * 1000, max: 60,
    message: { error: 'Demasiadas solicitudes. Intentá en un momento.' },
    standardHeaders: true, legacyHeaders: false,
});

// Rate limit más estricto para lookup — evitar enumeración de DNIs
const lookupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 10,
    message: { error: 'Demasiados intentos de búsqueda. Esperá 15 minutos.' },
    standardHeaders: true, legacyHeaders: false,
    skipSuccessfulRequests: false,
});

const bookLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 8,
    message: { error: 'Demasiados intentos. Esperá 15 minutos antes de volver a intentar.' },
    standardHeaders: true, legacyHeaders: false,
});

router.get('/:lavaderoId/info', infoLimiter, controller.getInfo);
router.get('/:lavaderoId/slots', slotsLimiter, controller.getSlots);
router.post('/:lavaderoId/lookup', lookupLimiter, controller.lookup);
router.post('/:lavaderoId/book', bookLimiter, controller.book);

module.exports = router;