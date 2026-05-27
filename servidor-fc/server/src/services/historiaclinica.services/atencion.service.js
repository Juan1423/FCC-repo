const { models } = require("../../libs/sequelize");

class AtencionService {
  constructor() {}

  async find() {
    return await models.Aps.findAll();
  }
  async create(data) {
    
    const res = await models.Aps.create(data);
    return res;
  }

  async findByHistoria(id_historia) {
    return await models.Aps.findAll({
      where: { id_historia },
    });
  }

  async findById(id_aps) {
    return await models.Aps.findOne({
      where: { id_aps },
    });
  }

  async update(id, data) {
    const model = await this.findById(id);
    const res = await model.update(data);
    return res;
  }

  async delete(id) {
    const model = await this.findById(id);
    await model.destroy();
    return { deleted: true };
  }

  async findFirstByHistoria(id_historia) {
    return await models.Aps.findOne({
      where: { id_historia },
      order: [['fecha_atencion', 'ASC']]
    });
  }

}

module.exports = AtencionService;
