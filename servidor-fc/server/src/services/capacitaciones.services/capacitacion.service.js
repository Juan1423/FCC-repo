const { models } = require('../../libs/sequelize');

class CapacitacionService {
    constructor() {}

    async find() {
        return await models.Capacitacion.findAll({
            order: [['fecha_inicio', 'DESC']]
        });
    }

    async findOne(id) {
        return await models.Capacitacion.findByPk(id);
    }

    async create(data) {
        return await models.Capacitacion.create(data);
    }

    async update(id, data) {
        const model = await this.findOne(id);
        return await model.update(data);
    }

    async delete(id) {
        const model = await this.findOne(id);
        await model.destroy();
        return { deleted: true };
    }
}

module.exports = CapacitacionService;