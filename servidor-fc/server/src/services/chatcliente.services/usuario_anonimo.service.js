'use strict';

const sequelizeLib = require('../../libs/sequelize');
const { Op } = require('sequelize');

class UsuarioAnonimoService {
  async _ensureModels() {
    // Asegurarse de que Sequelize haya inicializado los modelos antes de usarlos.
    if (sequelizeLib.initSequelize) {
      await sequelizeLib.initSequelize;
    }

    const models = sequelizeLib.models;
    if (!models || !models.UsuarioAnonimo) {
      throw new Error('Modelo UsuarioAnonimo no está inicializado. Asegúrate de que initSequelize se haya completado.');
    }
    return models;
  }

  async create(data) {
    try {
      const { UsuarioAnonimo } = await this._ensureModels();

      // Verificar si la cédula ya existe
      const existing = await UsuarioAnonimo.findOne({
        where: { cedula: data.cedula }
      });
      if (existing) {
        throw new Error('La cédula ya está registrada');
      }

      const usuario = await UsuarioAnonimo.create(data);
      return usuario;
    } catch (error) {
      console.error('Error creando usuario anónimo:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { limit, offset, where, includeConversaciones = false } = options;
      const { UsuarioAnonimo, ConversacionAnonima } = await this._ensureModels();

      const include = includeConversaciones ? [{
        model: ConversacionAnonima,
        as: 'conversaciones',
        order: [['fecha_conversacion', 'DESC']]
      }] : [];

      const usuarios = await UsuarioAnonimo.findAll({
        where,
        limit,
        offset,
        order: [['ultima_actividad', 'DESC']],
        include,
        attributes: { exclude: ['updated_at'] }
      });
      return usuarios;
    } catch (error) {
      console.error('Error obteniendo usuarios anónimos:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const { UsuarioAnonimo, ConversacionAnonima } = await this._ensureModels();

      const usuario = await UsuarioAnonimo.findByPk(id, {
        include: [{
          model: ConversacionAnonima,
          as: 'conversaciones',
          order: [['fecha_conversacion', 'DESC']]
        }]
      });
      return usuario;
    } catch (error) {
      console.error('Error obteniendo usuario anónimo por ID:', error);
      throw error;
    }
  }

  async findByCedula(cedula) {
    try {
      const { UsuarioAnonimo, ConversacionAnonima } = await this._ensureModels();

      const usuario = await UsuarioAnonimo.findOne({
        where: { cedula },
        include: [{
          model: ConversacionAnonima,
          as: 'conversaciones',
          order: [['fecha_conversacion', 'DESC']]
        }]
      });
      return usuario;
    } catch (error) {
      console.error('Error obteniendo usuario anónimo por cédula:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const { UsuarioAnonimo } = await this._ensureModels();

      // Si se actualiza cédula, verificar unicidad
      if (data.cedula) {
        const existing = await UsuarioAnonimo.findOne({
          where: { cedula: data.cedula, id_usuario_anonimo: { [Op.ne]: id } }
        });
        if (existing) {
          throw new Error('La cédula ya está registrada por otro usuario');
        }
      }

      const [updated] = await UsuarioAnonimo.update(data, {
        where: { id_usuario_anonimo: id }
      });
      if (updated) {
        return await this.findById(id);
      }
      return null;
    } catch (error) {
      console.error('Error actualizando usuario anónimo:', error);
      throw error;
    }
  }

  async updateUltimaActividad(id) {
    try {
      const { UsuarioAnonimo } = await this._ensureModels();

      await UsuarioAnonimo.update(
        { ultima_actividad: new Date() },
        { where: { id_usuario_anonimo: id } }
      );
      return true;
    } catch (error) {
      console.error('Error actualizando última actividad:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const { UsuarioAnonimo } = await this._ensureModels();

      const deleted = await UsuarioAnonimo.destroy({
        where: { id_usuario_anonimo: id }
      });
      return deleted > 0;
    } catch (error) {
      console.error('Error eliminando usuario anónimo:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const { UsuarioAnonimo, ConversacionAnonima } = await this._ensureModels();

      const total = await UsuarioAnonimo.count();
      const activos = await UsuarioAnonimo.count({
        where: { estado: true }
      });
      const withConversations = await UsuarioAnonimo.count({
        include: [{
          model: ConversacionAnonima,
          as: 'conversaciones',
          required: true
        }],
        distinct: true
      });

      return {
        total,
        activos,
        inactivos: total - activos,
        withConversations
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios anónimos:', error);
      throw error;
    }
  }

  async block(id) {
    try {
      const { UsuarioAnonimo } = await this._ensureModels();
      const usuario = await UsuarioAnonimo.findByPk(id);
      if (!usuario) {
        return { success: false, message: 'Usuario anónimo no encontrado' };
      }
      await usuario.update({ estado: false });
      return { success: true, message: 'Usuario anónimo bloqueado exitosamente', data: usuario };
    } catch (error) {
      console.error('Error bloqueando usuario anónimo:', error);
      throw error;
    }
  }

  async unblock(id) {
    try {
      const { UsuarioAnonimo } = await this._ensureModels();
      const usuario = await UsuarioAnonimo.findByPk(id);
      if (!usuario) {
        return { success: false, message: 'Usuario anónimo no encontrado' };
      }
      await usuario.update({ estado: true });
      return { success: true, message: 'Usuario anónimo desbloqueado exitosamente', data: usuario };
    } catch (error) {
      console.error('Error desbloqueando usuario anónimo:', error);
      throw error;
    }
  }
}

module.exports = new UsuarioAnonimoService();