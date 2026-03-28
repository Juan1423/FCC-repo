'use strict';

const preguntaAnonimaService = require('../../services/chatcliente.services/pregunta_anonima.service');

class PreguntaAnonimaController {
  async create(req, res) {
    try {
      const data = req.body;
      const pregunta = await preguntaAnonimaService.create(data);
      res.status(201).json({
        success: true,
        message: 'Pregunta anónima registrada exitosamente',
        data: pregunta
      });
    } catch (error) {
      console.error('Error en create pregunta anonima:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, cedula } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (cedula) where.cedula = cedula;

      const preguntas = await preguntaAnonimaService.findAll({
        limit: parseInt(limit),
        offset,
        where
      });

      res.status(200).json({
        success: true,
        message: 'Preguntas anónimas obtenidas exitosamente',
        data: preguntas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error en getAll preguntas anonimas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const pregunta = await preguntaAnonimaService.findById(id);
      if (!pregunta) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta anónima no encontrada'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Pregunta anónima obtenida exitosamente',
        data: pregunta
      });
    } catch (error) {
      console.error('Error en getById pregunta anonima:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getByCedula(req, res) {
    try {
      const { cedula } = req.params;
      const preguntas = await preguntaAnonimaService.findByCedula(cedula);
      res.status(200).json({
        success: true,
        message: 'Preguntas obtenidas por cédula exitosamente',
        data: preguntas
      });
    } catch (error) {
      console.error('Error en getByCedula:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await preguntaAnonimaService.getStats();
      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new PreguntaAnonimaController();