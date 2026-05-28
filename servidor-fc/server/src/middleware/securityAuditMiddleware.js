const { models } = require('../libs/sequelize');
const jwt = require('jsonwebtoken');

const PUBLIC_ROUTES = [
  { method: 'POST', path: '/auth' },
  { method: 'POST', path: '/users/login' },
];

const getRequestIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || (req.connection && req.connection.remoteAddress) || null;
};

const isIpBlocked = async (ip) => {
  if (!ip) return false;
  try {
    const blocked = await models.Seguridad.findOne({
      where: {
        action: 'block_ip',
        ip_address: ip,
        activo: true
      }
    });
    return !!blocked;
  } catch (error) {
    console.error('Error verificando bloqueo de IP:', error);
    return false;
  }
};

function getModuleFromPath(path) {
  const match = path.match(/\/api\/fcc\/([^\/]+)/);
  if (match) return match[1];
  return 'unknown';
}

function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  ['token', 'password', 'newPassword', 'confirmPassword', 'oldPassword'].forEach(f => delete sanitized[f]);
  return sanitized;
}

const securityAuditMiddleware = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const isPublic = PUBLIC_ROUTES.some(
    r => r.method === req.method && req.path === r.path
  );
  if (isPublic) return next();

  const ip = getRequestIp(req);
  if (await isIpBlocked(ip)) {
    return res.status(403).json({ mensaje: 'Acceso denegado desde esta IP' });
  }

  const token = req.headers["token"];
  const visitorId = req.headers["visitor-id"];

  if (!token && visitorId) {
    req.user = { user: visitorId, isVisitor: true, visitorId };
    req.isVisitor = true;
    return next();
  }

  if (!token) {
    return res.status(400).json({ mensaje: "Verificación de token errónea, debes enviar un token" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;

    const now = new Date();
    const detalle = JSON.stringify({
      params: req.params,
      query: req.query,
      body: sanitizeBody(req.body)
    });

    models.Auditoria.create({
      id_usuario: req.user.user,
      modulo: getModuleFromPath(req.path),
      operacion: req.method,
      detalle,
      fecha: now,
      hora_ingreso: now.toTimeString().split(' ')[0]
    }).catch(err => console.error('Error al registrar auditoría:', err));

    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};

module.exports = securityAuditMiddleware;
