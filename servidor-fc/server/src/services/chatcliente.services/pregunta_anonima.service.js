'use strict';

const { models } = require('../../libs/sequelize');

class PreguntaAnonimaService {
  async create(data) {
    try {
      const pregunta = await models.PreguntaAnonima.create(data);
      return pregunta;
    } catch (error) {
      console.error('Error creando pregunta anónima:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { limit, offset, where } = options;
      const preguntas = await models.PreguntaAnonima.findAll({
        where,
        limit,
        offset,
        order: [['fecha_pregunta', 'DESC']],
        attributes: { exclude: ['updated_at'] }
      });
      return preguntas;
    } catch (error) {
      console.error('Error obteniendo preguntas anónimas:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const pregunta = await models.PreguntaAnonima.findByPk(id);
      return pregunta;
    } catch (error) {
      console.error('Error obteniendo pregunta anónima por ID:', error);
      throw error;
    }
  }

  async findByCedula(cedula) {
    try {
      const preguntas = await models.PreguntaAnonima.findAll({
        where: { cedula },
        order: [['fecha_pregunta', 'DESC']]
      });
      return preguntas;
    } catch (error) {
      console.error('Error obteniendo preguntas por cédula:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const total = await models.PreguntaAnonima.count();
      const uniqueUsers = await PreguntaAnonima.count({
        distinct: true,
        col: 'cedula'
      });
      return { total, uniqueUsers };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

module.exports = new PreguntaAnonimaService();