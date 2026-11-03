'use strict';

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { hashIdentifier } = require('../utils/request.util');

const TOO_MANY_REQUESTS = {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.',
};

// Bypass opt-in para entornos locales/E2E. Se lee en tiempo de request porque
// app.js hace dotenv.config() despues de requerir este modulo.
const isRateLimitDisabled = () => process.env.RATE_LIMIT_DISABLED === 'true';

const buildLimiter = ({ windowMs, max, keyGenerator, message = TOO_MANY_REQUESTS, skipSuccessfulRequests = false }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        skipSuccessfulRequests,
        skip: isRateLimitDisabled,
        keyGenerator,
        handler: (req, res) => res.status(429).json(message),
    });

const apiLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 1000,
});

const loginLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const ip = ipKeyGenerator(req.ip || '');
        const correo = hashIdentifier(req.body?.correo_usuario || '') || 'sin-correo';
        return `login:${ip}:${correo}`;
    },
});

const chatPublicoLimiter = buildLimiter({
    windowMs: 60 * 1000,
    max: 20,
    keyGenerator: (req) => `chat:${ipKeyGenerator(req.ip || '')}`,
});

module.exports = { apiLimiter, loginLimiter, chatPublicoLimiter };
