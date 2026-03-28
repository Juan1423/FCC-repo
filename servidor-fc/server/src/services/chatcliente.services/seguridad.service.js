'use strict';

const { models } = require('../../libs/sequelize');
const { Seguridad } = models;

class SeguridadService {
  async create(data) {
    try {
      console.log('=== SEGURIDAD SERVICE CREATE ===');
      console.log('Datos a insertar:', JSON.stringify(data, null, 2));
      
      const seguridad = await Seguridad.create(data);
      
      console.log('✅ Registro de seguridad creado exitosamente:', seguridad.id_seguridad);
      return seguridad;
    } catch (error) {
      console.error('❌ Error creando registro de seguridad:');
      console.error('Nombre del error:', error.name);
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      if (error.errors) {
        console.error('Detalles de validación:', JSON.stringify(error.errors, null, 2));
      }
      if (error.parent) {
        console.error('Error de base de datos:', error.parent.message);
      }
      throw error;
    }
  }

  async findAll(options = {}) {
    try {
      const { limit, offset, where } = options;
      const seguridad = await Seguridad.findAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: models.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'email']
          },
          {
            model: models.Prompt,
            as: 'prompt',
            attributes: ['id_prompt', 'titulo']
          },
          {
            model: models.ConversacionAnonima,
            as: 'conversacionAnonima',
            include: [
              {
                model: models.UsuarioAnonimo,
                as: 'usuarioAnonimo',
                attributes: ['id_usuario_anonimo', 'nombre', 'cedula', 'estado']
              }
            ]
          }
        ]
      });
      return seguridad;
    } catch (error) {
      console.error('Error obteniendo registros de seguridad:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const seguridad = await Seguridad.findByPk(id, {
        include: [
          {
            model: models.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre', 'email']
          },
          {
            model: models.Prompt,
            as: 'prompt',
            attributes: ['id_prompt', 'titulo']
          },
          {
            model: models.ConversacionAnonima,
            as: 'conversacionAnonima',
            include: [
              {
                model: models.UsuarioAnonimo,
                as: 'usuarioAnonimo',
                attributes: ['id_usuario_anonimo', 'nombre', 'cedula', 'estado']
              }
            ]
          }
        ]
      });
      return seguridad;
    } catch (error) {
      console.error('Error obteniendo registro de seguridad por ID:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [updated] = await Seguridad.update(data, {
        where: { id_seguridad: id }
      });
      if (updated) {
        return await this.findById(id);
      }
      return null;
    } catch (error) {
      console.error('Error actualizando registro de seguridad:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const deleted = await Seguridad.destroy({
        where: { id_seguridad: id }
      });
      return deleted > 0;
    } catch (error) {
      console.error('Error eliminando registro de seguridad:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const total = await Seguridad.count();
      const byAction = await Seguridad.findAll({
        attributes: [
          'action',
          [require('sequelize').fn('COUNT', require('sequelize').col('action')), 'count']
        ],
        group: ['action']
      });
      const byStatusCode = await Seguridad.findAll({
        attributes: [
          'status_code',
          [require('sequelize').fn('COUNT', require('sequelize').col('status_code')), 'count']
        ],
        group: ['status_code']
      });
      return { total, byAction, byStatusCode };
    } catch (error) {
      console.error('Error obteniendo estadísticas de seguridad:', error);
      throw error;
    }
  }

  async blockIp(ipAddress) {
    try {
      const blocked = await Seguridad.create({
        action: 'block_ip',
        ip_address: ipAddress,
        status_code: 403,
        descripcion: `Bloqueo por IP: ${ipAddress}`,
        activo: true
      });
      return blocked;
    } catch (error) {
      console.error('Error bloqueando IP:', error);
      throw error;
    }
  }

  async unblockIp(ipAddress) {
    try {
      const [updated] = await Seguridad.update(
        { activo: false },
        {
          where: {
            action: 'block_ip',
            ip_address: ipAddress,
            activo: true
          }
        }
      );
      return { updated };
    } catch (error) {
      console.error('Error desbloqueando IP:', error);
      throw error;
    }
  }
}

module.exports = new SeguridadService();