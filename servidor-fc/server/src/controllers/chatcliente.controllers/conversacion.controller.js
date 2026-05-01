const { models } = require('../../libs/sequelize');
const { Sequelize } = require('sequelize');
const openaiService = require('../../services/openaiService');

const getAll = async (req, res) => {
  try {
    const conversaciones = await models.Conversacion.findAll({
      order: [['fecha_conversacion', 'DESC']]
    });
    res.json(conversaciones);
  } catch (error) {
    console.error('Error fetching conversaciones:', error);
    res.status(500).send({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const conversacion = await models.Conversacion.findByPk(id, {
      include: [
        { model: models.Usuario, as: 'usuario' }
      ]
    });
    if (!conversacion) {
      return res.status(404).json({ success: false, message: 'Conversacion not found' });
    }
    res.json(conversacion);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const getByUser = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const conversaciones = await models.Conversacion.findAll({
      where: { id_usuario },
      order: [['createdAt', 'DESC']]
    });
    res.json(conversaciones);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const clearMemory = async (req, res) => {
  try {
    const id_usuario = req.user.user;
    const result = await models.Conversacion.destroy({
      where: { id_usuario }
    });
    res.json({ 
      success: true, 
      message: 'Memoria del chat limpiada exitosamente',
      deletedCount: result 
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalConversaciones = await models.Conversacion.count();
    
    const estadisticas = await models.Conversacion.findAll({
      attributes: [
        'id_usuario',
        [Sequelize.fn('COUNT', Sequelize.col('id_conversacion')), 'totalMensajes'],
        [Sequelize.fn('AVG', Sequelize.col('tiempo_respuesta')), 'tiempoPromedio'],
        [Sequelize.fn('SUM', Sequelize.col('tokens_usados')), 'tokensTotal'],
        [Sequelize.fn('MAX', Sequelize.col('createdAt')), 'ultimaInteraccion']
      ],
      group: ['id_usuario'],
      raw: true,
      order: [[Sequelize.fn('COUNT', Sequelize.col('id_conversacion')), 'DESC']]
    });

    const statsGlobales = {
      totalConversaciones,
      usuariosActivos: estadisticas.length,
      tokensTotalesUsados: estadisticas.reduce((sum, stat) => sum + (stat.tokensTotal || 0), 0),
      tiempoPromedioGlobal: Math.round(estadisticas.reduce((sum, stat) => sum + (stat.tiempoPromedio || 0), 0) / estadisticas.length),
      usuariosMasActivos: estadisticas.slice(0, 5)
    };

    res.json(statsGlobales);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje_usuario, respuesta_bot } = req.body;

    const conversacion = await models.Conversacion.findByPk(id);
    if (!conversacion) {
      return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
    }

    // Verificar que el usuario solo pueda editar sus propias conversaciones
    if (conversacion.id_usuario !== req.user.user) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para editar esta conversación' });
    }

    await conversacion.update({
      mensaje_usuario,
      respuesta_bot,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Conversación actualizada exitosamente',
      data: conversacion
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const conversacion = await models.Conversacion.findByPk(id);
    if (!conversacion) {
      return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
    }

    // Verificar que el usuario solo pueda eliminar sus propias conversaciones
    if (conversacion.id_usuario !== req.user.user) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta conversación' });
    }

    await conversacion.destroy();

    res.json({
      success: true,
      message: 'Conversación eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const usarConversacionEspecifico = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El mensaje es requerido'
      });
    }

    // Buscar la conversación específica
    const conversacion = await models.Conversacion.findByPk(id);
    if (!conversacion) {
      return res.status(404).json({
        success: false,
        message: 'Conversación no encontrada'
      });
    }

    // Verificar que el usuario tenga acceso a esta conversación
    if (conversacion.id_usuario !== req.user.user) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para usar esta conversación'
      });
    }

    // Preparar el conocimiento específico de la conversación
    const conocimientoEspecifico = {
      pregunta_frecuente: conversacion.mensaje_usuario,
      respuesta_oficial: conversacion.respuesta_bot,
      fuente_verificacion: 'historial_conversaciones_usuario',
      tema_principal: 'conversacion_especifica'
    };

    // Usar el servicio de OpenAI con conocimiento específico
    const respuesta = await openaiService.chat(mensaje, req.user.user, conocimientoEspecifico);

    res.json({
      success: true,
      message: 'Consulta realizada con conocimiento específico de la conversación',
      data: {
        respuesta,
        conversacion_utilizada: {
          id: conversacion.id_conversacion,
          mensaje_usuario: conversacion.mensaje_usuario,
          respuesta_bot: conversacion.respuesta_bot
        }
      }
    });

  } catch (error) {
    console.error('Error usando conversación específica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la consulta con conversación específica',
      error: error.message
    });
  }
};

module.exports = { getAll, getById, getByUser, clearMemory, getStats, update, deleteById, usarConversacionEspecifico };