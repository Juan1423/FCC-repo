'use strict';

const usuarioAnonimoService = require('../../services/chatcliente.services/usuario_anonimo.service');

class UsuarioAnonimoController {
  async create(req, res) {
    try {
      const data = req.body;
      const usuario = await usuarioAnonimoService.create(data);
      res.status(201).json({
        success: true,
        message: 'Usuario anónimo registrado exitosamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error en create usuario anonimo:', error);
      const statusCode = error.message.includes('ya está registrada') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, estado, include_conversaciones = false } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (estado !== undefined) where.estado = estado === 'true';

      const usuarios = await usuarioAnonimoService.findAll({
        limit: parseInt(limit),
        offset,
        where,
        includeConversaciones: include_conversaciones === 'true'
      });

      res.status(200).json({
        success: true,
        message: 'Usuarios anónimos obtenidos exitosamente',
        data: usuarios,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error en getAll usuario anonimo:', error);
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
      const usuario = await usuarioAnonimoService.findById(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario anónimo no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario anónimo obtenido exitosamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error en getById usuario anonimo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getByCedula(req, res) {
    try {
      const { cedula } = req.params;
      const usuario = await usuarioAnonimoService.findByCedula(cedula);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario anónimo no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario anónimo obtenido exitosamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error en getByCedula usuario anonimo:', error);
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

      const usuario = await usuarioAnonimoService.update(id, data);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario anónimo no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario anónimo actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error en update usuario anonimo:', error);
      const statusCode = error.message.includes('ya está registrada') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async block(req, res) {
    try {
      const { id } = req.params;
      const result = await usuarioAnonimoService.block(id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error en block usuario anonimo:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async unblock(req, res) {
    try {
      const { id } = req.params;
      const result = await usuarioAnonimoService.unblock(id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error en unblock usuario anonimo:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateUltimaActividad(req, res) {
    try {
      const { id } = req.params;
      await usuarioAnonimoService.updateUltimaActividad(id);

      res.status(200).json({
        success: true,
        message: 'Última actividad actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error en updateUltimaActividad:', error);
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
      const deleted = await usuarioAnonimoService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Usuario anónimo no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario anónimo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en delete usuario anonimo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await usuarioAnonimoService.getStats();
      res.status(200).json({
        success: true,
        message: 'Estadísticas de usuarios anónimos obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      console.error('Error en getStats usuario anonimo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new UsuarioAnonimoController();