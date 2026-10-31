'use strict';

const jwt = require('jsonwebtoken');

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = process.env.JWT_ISSUER || 'fcc';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'fcc-web';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET no está configurado');
    }
    return secret;
};

const signAuthToken = (payload, options = {}) => jwt.sign(payload, getSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: options.expiresIn || JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
});

const verifyAuthToken = (token) => jwt.verify(token, getSecret(), {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
});

module.exports = {
    signAuthToken,
    verifyAuthToken,
    JWT_ALGORITHM,
    JWT_EXPIRES_IN,
};
