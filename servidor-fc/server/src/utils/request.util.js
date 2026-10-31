'use strict';

const crypto = require('crypto');

const getRequestIp = (req) => {
    if (!req) return null;
    if (req.ip) return req.ip;
    if (req.socket && req.socket.remoteAddress) return req.socket.remoteAddress;
    if (req.connection && req.connection.remoteAddress) return req.connection.remoteAddress;
    return null;
};

const hashIdentifier = (value) => {
    if (value === null || value === undefined || value === '') return null;
    return crypto.createHash('sha256').update(String(value)).digest('hex');
};

module.exports = { getRequestIp, hashIdentifier };
