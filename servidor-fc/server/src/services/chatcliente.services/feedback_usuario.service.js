const { models } = require('../../libs/sequelize');

class FeedbackUsuarioService {
    constructor() {}

    async create(data) {
        const res = await models.FeedbackUsuario.create(data);
        return res;
    }

    async find() {
        const res = await models.FeedbackUsuario.findAll();
        return res;
    }

    async findOne(id) {
        const res = await models.FeedbackUsuario.findByPk(id);
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

module.exports = FeedbackUsuarioService;