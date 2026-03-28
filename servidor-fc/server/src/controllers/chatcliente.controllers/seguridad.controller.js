'use strict';

const seguridadService = require('../../services/chatcliente.services/seguridad.service');

class SeguridadController {
  async create(req, res) {
    try {
      const data = req.body;

      // Capturar datos de seguridad de la petición HTTP
      const ipAddress = req.headers['x-forwarded-for'] || req.ip || (req.connection && req.connection.remoteAddress) || null;
      const userAgent = req.headers['user-agent'] || null;
      const referer = req.headers['referer'] || req.headers['referrer'] || null;

      const parseUserAgent = (ua) => {
        if (!ua) return { browser: null, os: null, device: null };
        const lower = ua.toLowerCase();
        let browser = null;
        let os = null;
        let device = null;

        if (lower.includes('chrome') && !lower.includes('edg')) browser = 'Chrome';
        else if (lower.includes('firefox')) browser = 'Firefox';
        else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
        else if (lower.includes('edg')) browser = 'Edge';
        else if (lower.includes('opera') || lower.includes('opr')) browser = 'Opera';
        else browser = 'Unknown';

        if (lower.includes('windows')) os = 'Windows';
        else if (lower.includes('mac os') || lower.includes('macintosh')) os = 'macOS';
        else if (lower.includes('android')) os = 'Android';
        else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';
        else if (lower.includes('linux')) os = 'Linux';
        else os = 'Unknown';

        if (lower.includes('mobile')) device = 'Mobile';
        else if (lower.includes('tablet')) device = 'Tablet';
        else device = 'Desktop';

        return { browser, os, device };
      };

      const { browser, os, device } = parseUserAgent(userAgent);

      data.ip_address = ipAddress;
      data.user_agent = userAgent;
      data.browser = browser;
      data.os = os;
      data.device = device;
      data.referer = referer;
      data.headers = {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        referer,
        'user-agent': userAgent
      };

      // Agregar user_id si está autenticado
      if (req.user && req.user.id_usuario) {
        data.user_id = req.user.id_usuario;
      }

      // Si se recibe action, guardarlo en action. Para compatibilidad, también copiar a tipo_seguridad
      if (data.action && !data.tipo_seguridad) {
        data.tipo_seguridad = data.action;
      } else if (data.tipo_seguridad && !data.action) {
        data.action = data.tipo_seguridad;
      }

      const seguridad = await seguridadService.create(data);
      res.status(201).json({
        success: true,
        message: 'Registro de seguridad creado exitosamente',
        data: seguridad
      });
    } catch (error) {
      console.error('Error en create seguridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, user_id, action, status_code, id_conversacion_anonima } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (user_id) where.user_id = user_id;
      if (id_conversacion_anonima) where.id_conversacion_anonima = id_conversacion_anonima;
      if (action) where.action = action;
      if (status_code) where.status_code = parseInt(status_code);

      const seguridad = await seguridadService.findAll({
        limit: parseInt(limit),
        offset,
        where
      });

      res.status(200).json({
        success: true,
        message: 'Registros de seguridad obtenidos exitosamente',
        data: seguridad,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error en getAll seguridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const seguridad = await seguridadService.findById(id);

      if (!seguridad) {
        return res.status(404).json({
          success: false,
          message: 'Registro de seguridad no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Registro de seguridad obtenido exitosamente',
        data: seguridad
      });
    } catch (error) {
      console.error('Error en getById seguridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const seguridad = await seguridadService.update(id, data);

      if (!seguridad) {
        return res.status(404).json({
          success: false,
          message: 'Registro de seguridad no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Registro de seguridad actualizado exitosamente',
        data: seguridad
      });
    } catch (error) {
      console.error('Error en update seguridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await seguridadService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Registro de seguridad no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Registro de seguridad eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en delete seguridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await seguridadService.getStats();
      res.status(200).json({
        success: true,
        message: 'Estadísticas de seguridad obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      console.error('Error en getStats seguridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async blockIp(req, res) {
    try {
      const { ip_address } = req.body;
      if (!ip_address) {
        return res.status(400).json({ success: false, message: 'ip_address es requerido' });
      }
      const result = await seguridadService.blockIp(ip_address);
      res.status(200).json({ success: true, message: 'IP bloqueada exitosamente', data: result });
    } catch (error) {
      console.error('Error en blockIp seguridad:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  async unblockIp(req, res) {
    try {
      const { ip_address } = req.body;
      if (!ip_address) {
        return res.status(400).json({ success: false, message: 'ip_address es requerido' });
      }
      const result = await seguridadService.unblockIp(ip_address);
      res.status(200).json({ success: true, message: 'IP desbloqueada exitosamente', data: result });
    } catch (error) {
      console.error('Error en unblockIp seguridad:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }
}

module.exports = new SeguridadController();