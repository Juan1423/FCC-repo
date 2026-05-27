const { models } = require("../../libs/sequelize");

class SignosVitalesServices {
  constructor() {}

  async find() {
    const res = await models.SignosVitales.findAll();
    return res;
  }

  async createSignosVitales(data) {
    try {
      const newSignosVitales = await models.SignosVitales.create(data);
      return newSignosVitales;
    } catch (error) {
      console.error(error);
      throw new Error("Error al crear signos vitales");

    }
  }

  async findById(id_signos_vitales) {
    return await models.SignosVitales.findOne({
      where: { id_signos_vitales },
    });
  }
  

  async findByHistoria(id_historia) {
    return await models.SignosVitales.findAll({
      where: { id_historia },
    });
  }

  async findByAps(id_aps){
    return await models.SignosVitales.findAll({
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
}

module.exports = SignosVitalesServices;
