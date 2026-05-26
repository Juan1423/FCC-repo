const { models } = require('../../libs/sequelize');

class TipoDonanteService  { 
  
    constructor() {}

    async find() {
      const res = await models.TipoDonante.findAll();
      return res;
    }

    async findOne(id) {
      const res = await models.TipoDonante.findByPk(id);
      return res;
    }

    async create(data) {
      const res = await models.TipoDonante.create(data);
      return res;
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
  
  module.exports = TipoDonanteService;
