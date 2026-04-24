const { models } = require('../../libs/sequelize');

class IndicadorService  { 
  
    constructor() {}

    async find() {
      const res = await models.Indicador.findAll();   //--- nombre del models = models.Indicador
      return res;
    }

    async findOne(id) {
      const res = await models.Indicador.findByPk(id);
      return res;
    }

    async create(data) {
      const res = await models.Indicador.create(data);
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
  
  module.exports = IndicadorService;  //---- module.exports = exporta la Clase de Servicio 
//------------permite que se pueda acceder caso contrario estar[ia encapsulada y no tendr[ia acceso
