'use strict';

const { models } = require('../../libs/sequelize');
const { Conocimiento } = models;

class ConocimientoService {
  async create(data) {
    try {
      // Validar JSON si existe
      if (data.variaciones_pregunta) {
        JSON.parse(data.variaciones_pregunta); // Lanzará error si no es válido
      }
      const conocimiento = await Conocimiento.create(data);
      return conocimiento;
    } catch (error) {
      console.error('Error creando conocimiento:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { limit, offset, where, order } = options;
      const conocimientos = await Conocimiento.findAll({
        where,
        limit,
        offset,
        order: order || [['nivel_prioridad', 'DESC'], ['created_at', 'DESC']],
        attributes: { exclude: ['updated_at'] } // Excluir updated_at por defecto
      });
      return conocimientos;
    } catch (error) {
      console.error('Error obteniendo conocimientos:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const conocimiento = await Conocimiento.findByPk(id);
      return conocimiento;
    } catch (error) {
      console.error('Error obteniendo conocimiento por ID:', error);
      throw error;
    }
  }

  async findByTema(tema) {
    try {
      const conocimientos = await Conocimiento.findAll({
        where: {
          tema_principal: tema,
          estado_vigencia: true
        },
        order: [['nivel_prioridad', 'DESC']]
      });
      return conocimientos;
    } catch (error) {
      console.error('Error obteniendo conocimientos por tema:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      // Validar JSON si existe
      if (data.variaciones_pregunta) {
        JSON.parse(data.variaciones_pregunta);
      }
      const [updated] = await Conocimiento.update(data, {
        where: { id_conocimiento: id }
      });
      if (updated) {
        return await this.findById(id);
      }
      return null;
    } catch (error) {
      console.error('Error actualizando conocimiento:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const deleted = await Conocimiento.destroy({
        where: { id_conocimiento: id }
      });
      return deleted > 0;
    } catch (error) {
      console.error('Error eliminando conocimiento:', error);
      throw error;
    }
  }

  async toggleVigencia(id) {
    try {
      const conocimiento = await this.findById(id);
      if (!conocimiento) return null;

      const newEstado = !conocimiento.estado_vigencia;
      await conocimiento.update({ estado_vigencia: newEstado });
      return await this.findById(id);
    } catch (error) {
      console.error('Error cambiando vigencia:', error);
      throw error;
    }
  }

  async getTemas() {
    try {
      const temas = await Conocimiento.findAll({
        attributes: [
          'tema_principal',
          [require('sequelize').fn('COUNT', require('sequelize').col('tema_principal')), 'count']
        ],
        where: { estado_vigencia: true },
        group: ['tema_principal'],
        order: [['count', 'DESC']]
      });
      return temas;
    } catch (error) {
      console.error('Error obteniendo temas:', error);
      throw error;
    }
  }

  async searchPregunta(pregunta) {
    try {
      // Buscar en pregunta_frecuente y variaciones_pregunta
      const conocimientos = await Conocimiento.findAll({
        where: {
          estado_vigencia: true,
          [require('sequelize').Op.or]: [
            { pregunta_frecuente: { [require('sequelize').Op.iLike]: `%${pregunta}%` } },
            require('sequelize').where(
              require('sequelize').fn('LOWER', require('sequelize').col('variaciones_pregunta')),
              { [require('sequelize').Op.like]: `%${pregunta.toLowerCase()}%` }
            )
          ]
        },
        order: [['nivel_prioridad', 'DESC']]
      });
      return conocimientos;
    } catch (error) {
      console.error('Error buscando pregunta:', error);
      throw error;
    }
  }

  async toggleBloqueo(id) {
    try {
      const conocimiento = await this.findById(id);
      if (!conocimiento) return null;

      const newBloqueado = !conocimiento.bloqueado;

      // Si se bloquea, eliminar embedding para que no se use en RAG
      const updateData = { bloqueado: newBloqueado };
      if (newBloqueado) {
        updateData.embedding = null;
      }

      await conocimiento.update(updateData);
      return await this.findById(id);
    } catch (error) {
      console.error('Error cambiando bloqueo:', error);
      throw error;
    }
  }

  async bloquearMasivo(ids = null) {
    try {
      let whereCondition = {};
      if (ids && ids.length > 0) {
        whereCondition = { id_conocimiento: ids };
      }

      const [affectedCount] = await Conocimiento.update(
        { bloqueado: true },
        { where: whereCondition }
      );

      return {
        count: affectedCount,
        message: ids ? `${affectedCount} preguntas específicas bloqueadas` : `Todas las preguntas bloqueadas (${affectedCount})`
      };
    } catch (error) {
      console.error('Error bloqueando masivamente:', error);
      throw error;
    }
  }

  async desbloquearMasivo(ids = null) {
    try {
      let whereCondition = {};
      if (ids && ids.length > 0) {
        whereCondition = { id_conocimiento: ids };
      }

      const [affectedCount] = await Conocimiento.update(
        { bloqueado: false },
        { where: whereCondition }
      );

      return {
        count: affectedCount,
        message: ids ? `${affectedCount} preguntas específicas desbloqueadas` : `Todas las preguntas desbloqueadas (${affectedCount})`
      };
    } catch (error) {
      console.error('Error desbloqueando masivamente:', error);
      throw error;
    }
  }

  async ejecutarBloqueadas(ids = null) {
    try {
      let whereCondition = { bloqueado: true };
      if (ids && ids.length > 0) {
        whereCondition.id_conocimiento = ids;
      }

      const conocimientosBloqueados = await Conocimiento.findAll({
        where: whereCondition,
        order: [['nivel_prioridad', 'DESC']]
      });

      const resultados = [];
      let exitosas = 0;
      let fallidas = 0;

      // Importar el servicio de OpenAI
      const openaiService = require('../openaiService');

      for (const conocimiento of conocimientosBloqueados) {
        try {
          // Simular una consulta con la pregunta bloqueada para verificar que se detecta
          const respuesta = await openaiService.chat(
            conocimiento.pregunta_frecuente,
            null, // Sin usuario específico
            null, // Sin conocimiento específico forzado
            false, // No usar RAG automático
            null, // Sin filtros
            false, // No usar memoria
            null  // Sin conocimiento específico
          );

          // Verificar si la respuesta contiene el mensaje de bloqueo
          const contieneMensajeBloqueo = respuesta.toLowerCase().includes('no debo') ||
                                        respuesta.toLowerCase().includes('bloqueada') ||
                                        respuesta.toLowerCase().includes('prohibida');

          resultados.push({
            id: conocimiento.id_conocimiento,
            pregunta: conocimiento.pregunta_frecuente,
            bloqueada: conocimiento.bloqueado,
            respuesta_detectada: contieneMensajeBloqueo,
            respuesta_ia: respuesta.substring(0, 200) + '...'
          });

          if (contieneMensajeBloqueo) {
            exitosas++;
          } else {
            fallidas++;
          }

        } catch (error) {
          console.error(`Error procesando pregunta bloqueada ${conocimiento.id_conocimiento}:`, error);
          resultados.push({
            id: conocimiento.id_conocimiento,
            pregunta: conocimiento.pregunta_frecuente,
            error: error.message
          });
          fallidas++;
        }
      }

      return {
        total: conocimientosBloqueados.length,
        exitosas,
        fallidas,
        resultados
      };
    } catch (error) {
      console.error('Error ejecutando preguntas bloqueadas:', error);
      throw error;
    }
  }

  async resetAllEmbeddings() {
    try {
      const [affectedCount] = await Conocimiento.update(
        { embedding: null },
        { where: {} } // Reset all
      );

      console.log(`Reseteados ${affectedCount} embeddings`);
      return affectedCount;
    } catch (error) {
      console.error('Error reseteando embeddings:', error);
      throw error;
    }
  }
}

module.exports = new ConocimientoService();