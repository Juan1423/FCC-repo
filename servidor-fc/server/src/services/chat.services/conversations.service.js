'use strict';

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class ConversationsService {
    async getAll(options = {}) {
        const { limit = 50, offset = 0, where = {}, tipo = null } = options;
        const whereClause = { ...where };
        if (tipo) whereClause.tipo = tipo;

        const conversaciones = await models.ChatConversacion.findAll({
            where: whereClause,
            limit,
            offset,
            order: [['fecha_conversacion', 'DESC']],
            include: [
                { model: models.ChatPrompt, as: 'prompt', attributes: ['id_prompt', 'titulo', 'tipo_prompt'] },
            ],
        });
        return conversaciones;
    }

    async getById(id) {
        return models.ChatConversacion.findByPk(id, {
            include: [
                { model: models.ChatPrompt, as: 'prompt', attributes: ['id_prompt', 'titulo', 'tipo_prompt'] },
                { model: models.Usuario, as: 'usuario', attributes: ['id_usuario', 'nombre_usuario', 'correo_usuario'] },
            ],
        });
    }

    async getByUser(idUsuario, options = {}) {
        const { limit = 50, offset = 0 } = options;
        return models.ChatConversacion.findAll({
            where: { id_usuario: idUsuario },
            limit,
            offset,
            order: [['fecha_conversacion', 'DESC']],
        });
    }

    async getBySessionId(sessionId) {
        return models.ChatConversacion.findAll({
            where: { session_id: sessionId },
            order: [['fecha_conversacion', 'ASC']],
        });
    }

    async clearMemory(idUsuario) {
        if (idUsuario) {
            const result = await models.ChatConversacion.destroy({
                where: { id_usuario: idUsuario },
            });
            return { deleted: result };
        }
        return { deleted: 0 };
    }

    async getStats(options = {}) {
        const { tipo = null } = options;
        const where = tipo ? { tipo } : {};

        const totalConversaciones = await models.ChatConversacion.count({ where });
        const totalTokens = await models.ChatConversacion.sum('tokens_usados', {
            where,
            // eslint-disable-next-line
            where: { ...where, tokens_usados: { [Op.ne]: null } },
        });

        const stats = await models.ChatConversacion.findAll({
            attributes: [
                'id_usuario',
                [require('sequelize').fn('COUNT', require('sequelize').col('id_conversacion')), 'totalMensajes'],
                [require('sequelize').fn('AVG', require('sequelize').col('tiempo_respuesta')), 'tiempoPromedio'],
                [require('sequelize').fn('SUM', require('sequelize').col('tokens_usados')), 'tokensTotal'],
            ],
            where,
            group: ['id_usuario'],
            raw: true,
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('id_conversacion')), 'DESC']],
        });

        return {
            totalConversaciones,
            totalTokens,
            usuariosActivos: stats.length,
            usuariosMasActivos: stats.slice(0, 5),
        };
    }

    async update(id, data) {
        const conversacion = await models.ChatConversacion.findByPk(id);
        if (!conversacion) return null;
        await conversacion.update(data);
        return conversacion;
    }

    async delete(id) {
        const deleted = await models.ChatConversacion.destroy({
            where: { id_conversacion: id },
        });
        return deleted > 0;
    }

    async exportCSV(options = {}) {
        const { startDate, endDate, tipo = null } = options;
        const where = {};
        if (startDate) where.fecha_conversacion = { [Op.gte]: new Date(startDate) };
        if (endDate) {
            if (!where.fecha_conversacion) where.fecha_conversacion = {};
            where.fecha_conversacion[Op.lte] = new Date(endDate);
        }
        if (tipo) where.tipo = tipo;

        const rows = await models.ChatConversacion.findAll({
            where,
            order: [['fecha_conversacion', 'DESC']],
            raw: true,
        });

        const header = 'ID,Tipo,Usuario Anónimo,Usuario,Session,Prompt,Mensaje Bot,Tiempo,Tokens,Fecha\n';
        const lines = rows.map((r) => {
            return [
                r.id_conversacion,
                r.tipo,
                r.id_usuario_anonimo || '',
                r.id_usuario || '',
                r.session_id || '',
                r.id_prompt || '',
                (r.respuesta_bot || '').replace(/"/g, '""'),
                r.tiempo_respuesta || '',
                r.tokens_usados || '',
                r.fecha_conversacion,
            ].join(',');
        });

        return header + lines.join('\n');
    }
}

module.exports = ConversationsService;
