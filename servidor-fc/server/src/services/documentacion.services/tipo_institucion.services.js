const { models } = require('../../libs/sequelize');

class TipoInstitucionService  { 
  
    constructor() {}

    async find() {
      const res = await models.TipoInstitucion.findAll();   //--- nombre del models = models.TipoInstitucion
      return res;
    }

    async findOne(id) {
      const res = await models.TipoInstitucion.findByPk(id);
      return res;
    }

    async create(data) {
      const res = await models.TipoInstitucion.create(data);
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
  
  module.exports = TipoInstitucionService;  //---- module.exports = exporta la Clase de Servicio 
//------------permite que se pueda acceder caso contrario estar[ia encapsulada y no tendr[ia acceso
