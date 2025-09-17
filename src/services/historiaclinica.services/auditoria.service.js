const { models } = require("../../libs/sequelize");

class AuditoriaService {
  constructor() {}

  async find() {
    const res = await models.Auditoria.findAll({
      include: [{
        model: models.Usuario,
        as: 'usuario_auditoria',
        attributes: ['nombre_usuario', 'apellido_usuario', 'correo_usuario']
      }]
    });
    return res;
  }

  async findOne(id) {
    const res = await models.Auditoria.findByPk(id);
    return res;
  }

  async create(data) {
    try {
      const res = await models.Auditoria.create(data);
      return res;
    } catch (error) {
      console.error("Error al crear auditoría:", error);
      throw error;
    }
  }

  async update(id, data) {
    const model = await this.findOne(id);
    const res = await model.update(data);
    return res;
  }

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { deleted: true };
  }
}

module.exports = AuditoriaService;
