const { models } = require('../../libs/sequelize');

class RegistrarProcesosService  { 
  
    constructor() {}

    async find() {
      const res = await models.RegistrarProcesos.findAll();   //--- nombre del models = models.RegistrarProcesos
      return res;
    }

    async findOne(id) {
      const res = await models.RegistrarProcesos.findByPk(id);
      return res;
    }

    async create(data) {
      const res = await models.RegistrarProcesos.create(data);
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
  
  module.exports = RegistrarProcesosService;  //---- module.exports = exporta la Clase de Servicio 
//------------permite que se pueda acceder caso contrario estar[ia encapsulada y no tendr[ia acceso
