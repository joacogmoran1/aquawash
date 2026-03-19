// Instalar con: npm install pino pino-pretty
const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

    // En development: output legible. En producción: JSON puro para indexadores.
    ...(isDev && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss',
                ignore: 'pid,hostname',
            },
        },
    }),

    // En producción nunca loguear datos sensibles
    redact: ['req.headers.authorization', 'body.password', 'body.password_hash'],
});

module.exports = logger;