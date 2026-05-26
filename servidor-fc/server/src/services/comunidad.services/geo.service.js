const { models } = require('../../libs/sequelize');

class GeoService  { 
  
    constructor() {}

    async find() {
      const res = await models.Geo.findAll();
      return res;
    }

    async findOne(id) {
      const res = await models.Geo.findByPk(id);
      return res;
    }

    async create(data) {
      const res = await models.Geo.create(data);
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

    async findHijos(idPadre) {
      const res = await models.Geo.findAll({
        where: { id_padre: idPadre }
      });
      return res;
    }

    async findByNivel(nivel) {
      const res = await models.Geo.findAll({
        where: { nivel: nivel }
      });
      return res;
    }

    async findJerarquia(idGeo) {
      const geo = await this.findOne(idGeo);
      if (!geo) return null;
      
      const jerarquia = [];
      let actual = geo;
      
      while (actual) {
        jerarquia.unshift(actual);
        if (actual.id_padre) {
          actual = await this.findOne(actual.id_padre);
        } else {
          actual = null;
        }
      }
      
      return jerarquia;
    }
  
  }
  
  module.exports = GeoService;
