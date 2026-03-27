'use strict';

const { models } = require('../../libs/sequelize');
const { ConversacionAnonima } = models;

class ConversacionAnonimaService {
  async create(data) {
    try {
      const conversacion = await ConversacionAnonima.create(data);

      // Si hay id_usuario_anonimo, actualizar última actividad
      if (data.id_usuario_anonimo) {
        await require('./usuario_anonimo.service').updateUltimaActividad(data.id_usuario_anonimo);
      }

      return conversacion;
    } catch (error) {
      console.error('Error creando conversación anónima:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { limit, offset, where, order } = options;
      const { UsuarioAnonimo } = models;

      const conversaciones = await ConversacionAnonima.findAll({
        where,
        limit,
        offset,
        order: order || [['fecha_conversacion', 'DESC']],
        attributes: { exclude: ['updated_at'] },
        include: [
          {
            model: UsuarioAnonimo,
            as: 'usuarioAnonimo',
            attributes: ['id_usuario_anonimo', 'nombre', 'cedula'],
            required: false
          }
        ]
      });

      // Aplanar la estructura para facilitar el consumo en el frontend
      return conversaciones.map((conv) => {
        const plain = conv.get({ plain: true });
        return {
          ...plain,
          nombre: plain.usuarioAnonimo?.nombre || null,
          cedula: plain.usuarioAnonimo?.cedula || null
        };
      });
    } catch (error) {
      console.error('Error obteniendo conversaciones anónimas:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const conversacion = await ConversacionAnonima.findByPk(id);
      return conversacion;
    } catch (error) {
      console.error('Error obteniendo conversación anónima por ID:', error);
      throw error;
    }
  }

  async findByUsuario(idUsuario) {
    try {
      const conversaciones = await ConversacionAnonima.findAll({
        where: { id_usuario: idUsuario },
        order: [['fecha_conversacion', 'DESC']]
      });
      return conversaciones;
    } catch (error) {
      console.error('Error obteniendo conversaciones anónimas por usuario:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [updated] = await ConversacionAnonima.update(data, {
        where: { id_conversacion_anonima: id }
      });
      if (updated) {
        return await this.findById(id);
      }
      return null;
    } catch (error) {
      console.error('Error actualizando conversación anónima:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const deleted = await ConversacionAnonima.destroy({
        where: { id_conversacion_anonima: id }
      });
      return deleted > 0;
    } catch (error) {
      console.error('Error eliminando conversación anónima:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const total = await ConversacionAnonima.count();
      const withConsent = await ConversacionAnonima.count({
        where: { consentimiento: true }
      });
      const avgTokens = await ConversacionAnonima.findAll({
        attributes: [
          [require('sequelize').fn('AVG', require('sequelize').col('tokens_usados')), 'avg_tokens']
        ],
        where: {
          tokens_usados: { [require('sequelize').Op.ne]: null }
        },
        raw: true
      });
      return {
        total,
        withConsent,
        withoutConsent: total - withConsent,
        avgTokens: avgTokens[0]?.avg_tokens || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de conversaciones anónimas:', error);
      throw error;
    }
  }

  async clearUserConversations(idUsuario) {
    try {
      const deleted = await ConversacionAnonima.destroy({
        where: { id_usuario: idUsuario }
      });
      return deleted;
    } catch (error) {
      console.error('Error limpiando conversaciones anónimas del usuario:', error);
      throw error;
    }
  }
}

module.exports = new ConversacionAnonimaService();