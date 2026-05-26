const { models } = require('../../libs/sequelize');

class TipoDonacionService  { 
  
    constructor() {}

    async find() {
      const res = await models.TipoDonacion.findAll();
      return res;
    }

    async findOne(id) {
      const res = await models.TipoDonacion.findByPk(id);
      return res;
    }

    async create(data) {
      const res = await models.TipoDonacion.create(data);
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
  
  module.exports = TipoDonacionService;
