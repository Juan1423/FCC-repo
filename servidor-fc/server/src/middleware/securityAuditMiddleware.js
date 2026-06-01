const { models } = require('../libs/sequelize');
const jwt = require('jsonwebtoken');

const PUBLIC_ROUTES = [
  { method: 'POST', path: '/auth' },
  { method: 'POST', path: '/users/login' },
];

const SENSITIVE_FIELDS = ['token', 'password', 'newPassword', 'confirmPassword', 'oldPassword'];

const MODULE_OVERRIDES = {
  'auth': 'Autenticacion',
  'change-password': 'Autenticacion',
  'users': 'Usuarios',
  'personalsalud': 'PersonalSalud',
  'signos_vitales': 'SignosVitales',
  'tipo_especialidad': 'TipoEspecialidad',
  'tipo_terapia': 'TipoTerapia',
  'tipo_persona': 'TipoPersona',
  'tipo_documento': 'TipoDocumento',
  'tipo_indicador': 'TipoIndicador',
  'tipo_institucion': 'TipoInstitucion',
  'tipo_normativa': 'TipoNormativa',
  'tipo_proceso': 'TipoProceso',
  'tipo_donante': 'TipoDonante',
  'tipo_organizacion': 'TipoOrganizacion',
  'tipo_donacion': 'TipoDonacion',
  'item_donacion': 'ItemDonacion',
  'donante_nacional': 'DonanteNacional',
  'donante_internacional': 'DonanteInternacional',
  'donacion_nacional': 'DonacionNacional',
  'donacion_internacional': 'DonacionInternacional',
  'detalle_donacion': 'DetalleDonacion',
  'documento_donacion': 'DocumentoDonacion',
  'verificacion_donacion': 'VerificacionDonacion',
  'registrar_procesos': 'RegistrarProcesos',
  'conversacion-anonima': 'ConversacionAnonima',
  'usuario-anonimo': 'UsuarioAnonimo',
  'pregunta-anonima': 'PreguntaAnonima',
  'feedback-usuario': 'FeedbackUsuario',
  'cie11': 'Cie11',
  'chat': 'Chat',
};

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

function extractModuleSegment(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  return parts[0];
}

function snakeToPascal(str) {
  return str.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function getModuleFromPath(path) {
  const segment = extractModuleSegment(path);
  if (!segment) return 'unknown';
  return MODULE_OVERRIDES[segment] || snakeToPascal(segment);
}

function getOperationName(method, path, moduleName) {
  const m = method.toUpperCase();
  const moduleUpper = moduleName.toUpperCase();

  if (/\/users\/login$/.test(path) && m === 'POST') return 'INICIAR_SESION';
  if (/\/auth$/.test(path) && m === 'POST') return 'VALIDAR_TOKEN';
  if (/\/change-password$/.test(path) && m === 'POST') return 'CAMBIAR_CONTRASENA';
  if (/\/estado\/\d+$/.test(path) && m === 'PUT') return `CAMBIAR_ESTADO_${moduleUpper}`;
  if (/\/seguridad\/block-ip$/.test(path) && m === 'POST') return 'BLOQUEAR_IP';
  if (/\/seguridad\/unblock-ip$/.test(path) && m === 'POST') return 'DESBLOQUEAR_IP';
  if (/\/register$/.test(path) && m === 'POST') return 'REGISTRAR';
  if (/\/login$/.test(path) && m === 'POST') return 'INICIAR_SESION';
  if (/\/atencion\/(historia|last|first)\/\d+$/.test(path) && m === 'GET') return `CONSULTAR_${moduleUpper}`;
  if (/\/enfermedades\/(historia|last)\/\d+$/.test(path) && m === 'GET') return `CONSULTAR_${moduleUpper}`;
  if (/\/examen\/(historia|last)\/\d+$/.test(path) && m === 'GET') return `CONSULTAR_${moduleUpper}`;
  if (/\/signos_vitales\/(historia|last|aps)\/\d+$/.test(path) && m === 'GET') return `CONSULTAR_${moduleUpper}`;
  if (/\/terapias\/(paciente|last)\/\d+$/.test(path) && m === 'GET') return `CONSULTAR_${moduleUpper}`;
  if (/\/users\/\d+\/estadisticas$/.test(path) && m === 'GET') return 'CONSULTAR_ESTADISTICAS';
  if (/\/\d+$/.test(path) && m === 'GET') return `CONSULTAR_${moduleUpper}`;
  if (/\/\d+$/.test(path) && m === 'PUT') return `ACTUALIZAR_${moduleUpper}`;
  if (/\/\d+$/.test(path) && m === 'DELETE') return `ELIMINAR_${moduleUpper}`;

  const actionMap = {
    GET: 'CONSULTAR',
    POST: 'CREAR',
    PUT: 'ACTUALIZAR',
    DELETE: 'ELIMINAR',
    PATCH: 'ACTUALIZAR',
  };

  return `${actionMap[m] || m}_${moduleUpper}`;
}

function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  SENSITIVE_FIELDS.forEach(f => delete sanitized[f]);
  return sanitized;
}

function buildDetail(req) {
  const detail = {};

  detail.endpoint = req.path;

  if (req.params && Object.keys(req.params).length > 0) {
    const paramKeys = Object.keys(req.params);
    if (paramKeys.length === 1 && req.params[paramKeys[0]]) {
      detail.id = req.params[paramKeys[0]];
    } else {
      detail.params = req.params;
    }
  }

  if (req.query && Object.keys(req.query).length > 0) {
    detail.query = req.query;
  }

  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const bodyKeys = Object.keys(req.body).filter(k => !SENSITIVE_FIELDS.includes(k));
    if (bodyKeys.length > 0) {
      detail.campos = bodyKeys;
    }
  }

  return JSON.stringify(detail);
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

    if (req.method === 'POST' && (req.path === '/auditoria' || req.path === '/auditoria/')) {
      return next();
    }

    const now = new Date();
    const moduleName = getModuleFromPath(req.path);
    const operacion = getOperationName(req.method, req.path, moduleName);

    const detalle = buildDetail(req);

    models.Auditoria.create({
      id_usuario: req.user.user,
      modulo: moduleName,
      operacion,
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
