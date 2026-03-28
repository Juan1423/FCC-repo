'use strict';

const conocimientoService = require('../../services/chatcliente.services/conocimiento.service');

class ConocimientoController {
  async create(req, res) {
    try {
      const data = req.body;
      const conocimiento = await conocimientoService.create(data);
      res.status(201).json({
        success: true,
        message: 'Conocimiento creado exitosamente',
        data: conocimiento
      });
    } catch (error) {
      console.error('Error en create conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, tema_principal, estado_vigencia, nivel_prioridad } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (tema_principal) where.tema_principal = tema_principal;
      if (estado_vigencia !== undefined) where.estado_vigencia = estado_vigencia === 'true';
      if (nivel_prioridad) where.nivel_prioridad = parseInt(nivel_prioridad);

      const conocimientos = await conocimientoService.findAll({
        limit: parseInt(limit),
        offset,
        where
      });

      res.status(200).json({
        success: true,
        message: 'Conocimientos obtenidos exitosamente',
        data: conocimientos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error en getAll conocimiento:', error);
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
      const conocimiento = await conocimientoService.findById(id);

      if (!conocimiento) {
        return res.status(404).json({
          success: false,
          message: 'Conocimiento no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conocimiento obtenido exitosamente',
        data: conocimiento
      });
    } catch (error) {
      console.error('Error en getById conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getByTema(req, res) {
    try {
      const { tema } = req.params;
      const conocimientos = await conocimientoService.findByTema(tema);

      res.status(200).json({
        success: true,
        message: `Conocimientos del tema '${tema}' obtenidos exitosamente`,
        data: conocimientos
      });
    } catch (error) {
      console.error('Error en getByTema conocimiento:', error);
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

      const conocimiento = await conocimientoService.update(id, data);

      if (!conocimiento) {
        return res.status(404).json({
          success: false,
          message: 'Conocimiento no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conocimiento actualizado exitosamente',
        data: conocimiento
      });
    } catch (error) {
      console.error('Error en update conocimiento:', error);
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
      const deleted = await conocimientoService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Conocimiento no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conocimiento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en delete conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async toggleVigencia(req, res) {
    try {
      const { id } = req.params;
      const conocimiento = await conocimientoService.toggleVigencia(id);

      if (!conocimiento) {
        return res.status(404).json({
          success: false,
          message: 'Conocimiento no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Vigencia del conocimiento cambiada exitosamente',
        data: conocimiento
      });
    } catch (error) {
      console.error('Error en toggleVigencia conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async getTemas(req, res) {
    try {
      const temas = await conocimientoService.getTemas();
      res.status(200).json({
        success: true,
        message: 'Temas obtenidos exitosamente',
        data: temas
      });
    } catch (error) {
      console.error('Error en getTemas conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async searchPregunta(req, res) {
    try {
      const { pregunta } = req.query;
      if (!pregunta) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro pregunta requerido'
        });
      }

      const conocimientos = await conocimientoService.searchPregunta(pregunta);
      res.status(200).json({
        success: true,
        message: 'Búsqueda realizada exitosamente',
        data: conocimientos
      });
    } catch (error) {
      console.error('Error en searchPregunta conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async generateEmbeddings(req, res) {
    try {
      const RAGService = require('../../services/chatcliente.services/ragService');
      const ragService = new RAGService();

      const { ids } = req.body; // Opcional: array de IDs específicos

      // Ejecutar en background para no bloquear la respuesta
      setImmediate(async () => {
        try {
          const result = await ragService.generateEmbeddingsForKnowledge(ids);
          console.log('Embeddings generados:', result);
        } catch (error) {
          console.error('Error generando embeddings en background:', error);
        }
      });

      res.status(202).json({
        success: true,
        message: 'Generación de embeddings iniciada en segundo plano',
        note: 'Este proceso puede tomar tiempo dependiendo del número de conocimientos'
      });
    } catch (error) {
      console.error('Error iniciando generación de embeddings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async regenerarMemoria(req, res) {
    try {
      const RAGService = require('../../services/chatcliente.services/ragService');
      const ragService = new RAGService();

      // Primero, resetear todos los embeddings a null
      await conocimientoService.resetAllEmbeddings();

      // Luego, regenerar solo para conocimientos no bloqueados
      setImmediate(async () => {
        try {
          const result = await ragService.generateEmbeddingsForKnowledge(null, { bloqueado: false });
          console.log('Memoria regenerada:', result);
        } catch (error) {
          console.error('Error regenerando memoria en background:', error);
        }
      });

      res.status(202).json({
        success: true,
        message: 'Regeneración de memoria del chatbot iniciada en segundo plano',
        note: 'Se están reseteando todos los embeddings y regenerando solo para preguntas permitidas (no bloqueadas)'
      });
    } catch (error) {
      console.error('Error iniciando regeneración de memoria:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async usarConocimientoEspecifico(req, res) {
    try {
      const { id } = req.params;
      const { mensaje } = req.body;

      if (!mensaje) {
        return res.status(400).json({
          success: false,
          message: 'El campo mensaje es requerido'
        });
      }

      // Obtener el conocimiento específico
      const conocimiento = await conocimientoService.findById(id);

      if (!conocimiento) {
        return res.status(404).json({
          success: false,
          message: 'Conocimiento no encontrado'
        });
      }

      if (!conocimiento.estado_vigencia) {
        return res.status(400).json({
          success: false,
          message: 'Este conocimiento no está vigente'
        });
      }

      // Importar el servicio de OpenAI y usar el conocimiento específico
      const { chat } = require('../../services/openaiService');

      // Obtener ID del usuario desde el token
      const idUsuario = req.user?.user || null;

      // Hacer la consulta usando el conocimiento específico
      const respuesta = await chat(mensaje, idUsuario, null, false, null, false, conocimiento);

      res.status(200).json({
        success: true,
        message: 'Consulta realizada usando conocimiento específico',
        data: {
          conocimiento_usado: {
            id: conocimiento.id_conocimiento,
            tema: conocimiento.tema_principal,
            pregunta: conocimiento.pregunta_frecuente,
            respuesta_oficial: conocimiento.respuesta_oficial
          },
          respuesta_ia: respuesta,
          mensaje_usuario: mensaje
        }
      });
    } catch (error) {
      console.error('Error usando conocimiento específico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async toggleBloqueo(req, res) {
    try {
      const { id } = req.params;
      const conocimiento = await conocimientoService.toggleBloqueo(id);

      if (!conocimiento) {
        return res.status(404).json({
          success: false,
          message: 'Conocimiento no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: `Pregunta ${conocimiento.bloqueado ? 'bloqueada' : 'desbloqueada'} exitosamente`,
        data: conocimiento
      });
    } catch (error) {
      console.error('Error en toggleBloqueo conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async bloquearTodos(req, res) {
    try {
      const { ids } = req.body; // Array de IDs opcional, si no se proporciona bloquea todos

      const result = await conocimientoService.bloquearMasivo(ids);

      res.status(200).json({
        success: true,
        message: `${result.count} preguntas bloqueadas exitosamente`,
        data: result
      });
    } catch (error) {
      console.error('Error en bloquearTodos conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async desbloquearTodos(req, res) {
    try {
      const { ids } = req.body; // Array de IDs opcional, si no se proporciona desbloquea todos

      const result = await conocimientoService.desbloquearMasivo(ids);

      res.status(200).json({
        success: true,
        message: `${result.count} preguntas desbloqueadas exitosamente`,
        data: result
      });
    } catch (error) {
      console.error('Error en desbloquearTodos conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  async ejecutarBloqueadas(req, res) {
    try {
      const { ids } = req.body; // Array de IDs opcional, si no se proporciona ejecuta todas las bloqueadas

      const result = await conocimientoService.ejecutarBloqueadas(ids);

      res.status(200).json({
        success: true,
        message: `Se procesaron ${result.total} preguntas bloqueadas`,
        data: result
      });
    } catch (error) {
      console.error('Error en ejecutarBloqueadas conocimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new ConocimientoController();