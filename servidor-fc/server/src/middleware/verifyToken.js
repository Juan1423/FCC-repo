const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { models } = require('../libs/sequelize');

dotenv.config();

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

const verifyToken = async (req, res, next) => {
  const ip = getRequestIp(req);
  if (await isIpBlocked(ip)) {
    return res.status(403).json({ mensaje: 'Acceso denegado desde esta IP' });
  }

  const token = req.headers["token"]; // Ensure the header key matches the client-side
  const secret = process.env.JWT_SECRET;
  if (token) {
    jwt.verify(token, secret, (error, data) => {
      if (error) {
        return res.status(401).json({ mensaje: "Token inválido" }); // Use 401 for unauthorized
      } else {
        console.log('Token decodificado:', data); // Debug
        req.user = data;
        next();
      }
    });
  } else {
    res.status(400).json({ mensaje: "Verificación de token errónea, debes enviar un token" });
  }
};

const getUserDataFromToken = (req,res) => {
  const token = req.headers["token"];
  const secret = process.env.JWT_SECRET;
  try {
    const data = jwt.verify(token, secret);
    return res.status(200).json({data});
  } catch (error) {
    res.status(400).json({ mensaje: "Token invalido AQUI" });
  }
};

const validateAndReturnUserData = (req,res) => {
  const token = req.headers["token"];
  const secret = process.env.JWT_SECRET;
  try {
    const data = jwt.verify(token, secret);
    return res.status(200).json({data : data, isValid: true});
  } catch (error) {
    return res.status(400).json({ mensaje: "Token invalido", isValid: false });
  }
};

const verifyTokenAdmin = async (req,res,next) => {
  const ip = getRequestIp(req);
  if (await isIpBlocked(ip)) {
    return res.status(403).json({ mensaje: 'Acceso denegado desde esta IP' });
  }

  const token = req.headers["token"];
  const secret = process.env.JWT_SECRET;
  if (token) {
    jwt.verify(token, secret
    , (error, data) => {
      if (error) return res.status(400).json({ mensaje: "Token invalido" });
      else {
        req.user = data;
        // Aceptar tanto rol 'admin' como 'administrador' por compatibilidad
        const userRol = String(req.user.rol || '').toLowerCase();
        if (userRol !== 'admin' && userRol !== 'administrador') {
          return res.status(400).json({ mensaje: 'No tienes permisos para realizar esta acción' });
        }
        next();
      }
    });
  } else {
    res.status(400).json({ mensaje: "Debes enviar un token" });
  }
}

const verifyTokenOrVisitor = async (req, res, next) => {
  const ip = getRequestIp(req);
  if (await isIpBlocked(ip)) {
    return res.status(403).json({ mensaje: 'Acceso denegado desde esta IP' });
  }

  const token = req.headers["token"];
  const visitorId = req.headers["visitor-id"];
  const secret = process.env.JWT_SECRET;
  
  // Aceptar usuarios autenticados con token
  if (token) {
    jwt.verify(token, secret, (error, data) => {
      if (error) {
        return res.status(401).json({ mensaje: "Token inválido" });
      } else {
        console.log('Token decodificado:', data);
        req.user = data;
        req.isVisitor = false;
        next();
      }
    });
  } 
  // Aceptar visitantes con visitor-id
  else if (visitorId) {
    // Para visitantes, usar el ID único del usuario anónimo (uuid)
    req.user = {
      user: visitorId,
      isVisitor: true,
      visitorId: visitorId
    };
    req.isVisitor = true;
    console.log('Visitante detectado:', visitorId);
    next();
  }
  // Si no hay token ni visitor-id, denegar acceso
  else {
    res.status(401).json({ mensaje: "Se requiere token o ID de visitante" });
  }
};

module.exports = { verifyToken, getUserDataFromToken, verifyTokenAdmin , validateAndReturnUserData, verifyTokenOrVisitor};