'use strict';

const conversacionAnonimaService = require('../../services/chatcliente.services/conversacion_anonima.service');

class ConversacionAnonimaController {
  async create(req, res) {
    try {
      const data = req.body;

      // Si no hay id_usuario_anonimo, verificar que sea admin
      if (!data.id_usuario_anonimo && !req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden crear conversaciones sin usuario anónimo'
        });
      }

      const conversacion = await conversacionAnonimaService.create(data);
      res.status(201).json({
        success: true,
        message: 'Conversación anónima creada exitosamente',
        data: conversacion
      });
    } catch (error) {
      console.error('Error en create conversacion anonima:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, id_usuario, consentimiento, fecha_desde, fecha_hasta } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (id_usuario) where.id_usuario = id_usuario;
      if (consentimiento !== undefined) where.consentimiento = consentimiento === 'true';
      if (fecha_desde || fecha_hasta) {
        where.fecha_conversacion = {};
        if (fecha_desde) where.fecha_conversacion[require('sequelize').Op.gte] = new Date(fecha_desde);
        if (fecha_hasta) where.fecha_conversacion[require('sequelize').Op.lte] = new Date(fecha_hasta);
      }

      const conversaciones = await conversacionAnonimaService.findAll({
        limit: parseInt(limit),
        offset,
        where
      });

      res.status(200).json({
        success: true,
        message: 'Conversaciones anónimas obtenidas exitosamente',
        data: conversaciones,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error en getAll conversacion anonima:', error);
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
      const conversacion = await conversacionAnonimaService.findById(id);

      if (!conversacion) {
        return res.status(404).json({
          success: false,
          message: 'Conversación anónima no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conversación anónima obtenida exitosamente',
        data: conversacion
      });
    } catch (error) {
      console.error('Error en getById conversacion anonima:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getByUsuario(req, res) {
    try {
      const { idUsuario } = req.params;
      const conversaciones = await conversacionAnonimaService.findByUsuario(idUsuario);

      res.status(200).json({
        success: true,
        message: `Conversaciones anónimas del usuario ${idUsuario} obtenidas exitosamente`,
        data: conversaciones
      });
    } catch (error) {
      console.error('Error en getByUsuario conversacion anonima:', error);
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

      const conversacion = await conversacionAnonimaService.update(id, data);

      if (!conversacion) {
        return res.status(404).json({
          success: false,
          message: 'Conversación anónima no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conversación anónima actualizada exitosamente',
        data: conversacion
      });
    } catch (error) {
      console.error('Error en update conversacion anonima:', error);
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
      const deleted = await conversacionAnonimaService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Conversación anónima no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conversación anónima eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en delete conversacion anonima:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await conversacionAnonimaService.getStats();
      res.status(200).json({
        success: true,
        message: 'Estadísticas de conversaciones anónimas obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      console.error('Error en getStats conversacion anonima:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async clearUserConversations(req, res) {
    try {
      const { idUsuario } = req.params;
      const deletedCount = await conversacionAnonimaService.clearUserConversations(idUsuario);

      res.status(200).json({
        success: true,
        message: `Se eliminaron ${deletedCount} conversaciones anónimas del usuario ${idUsuario}`
      });
    } catch (error) {
      console.error('Error en clearUserConversations:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new ConversacionAnonimaController();