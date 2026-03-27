const { models } = require('../../libs/sequelize');

class ConversacionService {
    constructor() {}

    async create(data) {
        const res = await models.Conversacion.create(data);
        return res;
    }

    async find() {
        const res = await models.Conversacion.findAll();
        return res;
    }

    async findOne(id) {
        const res = await models.Conversacion.findByPk(id);
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

    async findByUser(id_usuario) {
        const res = await models.Conversacion.findAll({
            where: { id_usuario }
        });
        return res;
    }

    async clearUserConversations(id_usuario) {
        const result = await models.Conversacion.destroy({
            where: { id_usuario }
        });
        return { deleted: result };
    }

    // Nuevo método: Limpia sesión actual SIN borrar historial en BD
    async clearCurrentSession(id_usuario, id_conversacion) {
        // Solo cierra la conversación actual, manteniendo el historial
        if (id_conversacion) {
            const conversation = await this.findOne(id_conversacion);
            if (conversation && conversation.id_usuario === id_usuario) {
                await conversation.update({ estado: 'cerrada', fecha_cierre: new Date() });
                return { success: true, message: 'Sesión limpiada. Historial guardado en BD.' };
            }
        }
        return { success: true, message: 'Sesión limpiada sin datos previos.' };
    }
}

module.exports = ConversacionService;