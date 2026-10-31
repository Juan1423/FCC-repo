const dotenv = require('dotenv');
const { verifyAuthToken } = require('../utils/jwt.util');
const { getRequestIp } = require('../utils/request.util');

dotenv.config();

const AUTH_COOKIE_NAME = 'auth_token';

const isIpBlocked = async (ip) => {
  if (!ip) return false;
  try {
    const blockedIPs = JSON.parse(process.env.BLOCKED_IPS || '[]');
    return blockedIPs.includes(ip);
  } catch (error) {
    console.error('Error verificando bloqueo de IP:', error);
    return false;
  }
};

const extractToken = (req) => {
  const headerToken = req.headers && req.headers['token'];
  if (typeof headerToken === 'string') {
    const trimmed = headerToken.trim();
    if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') return trimmed;
  }
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) return req.cookies[AUTH_COOKIE_NAME];
  return null;
};

const verifyToken = async (req, res, next) => {
  const ip = getRequestIp(req);
  if (await isIpBlocked(ip)) {
    return res.status(403).json({ mensaje: 'Acceso denegado desde esta IP' });
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(400).json({ mensaje: "Verificación de token errónea, debes enviar un token" });
  }

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};

const getUserDataFromToken = (req, res) => {
  try {
    const data = verifyAuthToken(extractToken(req));
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};

const validateAndReturnUserData = (req, res) => {
  try {
    const data = verifyAuthToken(extractToken(req));
    return res.status(200).json({ data: data, isValid: true });
  } catch (error) {
    return res.status(400).json({ mensaje: "Token inválido", isValid: false });
  }
};

const verifyTokenAdmin = async (req, res, next) => {
  const ip = getRequestIp(req);
  if (await isIpBlocked(ip)) {
    return res.status(403).json({ mensaje: 'Acceso denegado desde esta IP' });
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(400).json({ mensaje: "Debes enviar un token" });
  }

  try {
    req.user = verifyAuthToken(token);
  } catch (error) {
    return res.status(400).json({ mensaje: "Token inválido" });
  }

  const userRol = String(req.user.rol || '').toLowerCase();
  if (userRol !== 'admin' && userRol !== 'administrador') {
    return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
  }
  return next();
};

const verifyTokenOrVisitor = async (req, res, next) => {
  const ip = getRequestIp(req);
  if (await isIpBlocked(ip)) {
    return res.status(403).json({ mensaje: 'Acceso denegado desde esta IP' });
  }

  const token = extractToken(req);

  if (token) {
    try {
      req.user = verifyAuthToken(token);
      req.isVisitor = false;
      return next();
    } catch (error) {
      return res.status(401).json({ mensaje: "Token inválido" });
    }
  }

  const visitorId = req.headers && req.headers['visitor-id'];
  if (visitorId) {
    req.user = {
      user: visitorId,
      isVisitor: true,
      visitorId: visitorId
    };
    req.isVisitor = true;
    return next();
  }

  return res.status(401).json({ mensaje: "Se requiere token o ID de visitante" });
};

const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles.map(r => r.toLowerCase()) : [String(roles).toLowerCase()];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
    const userRol = String(req.user.rol || req.user.role || '').toLowerCase();
    if (!allowedRoles.includes(userRol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  getUserDataFromToken,
  verifyTokenAdmin,
  validateAndReturnUserData,
  verifyTokenOrVisitor,
  requireRole,
  extractToken,
  AUTH_COOKIE_NAME,
};
