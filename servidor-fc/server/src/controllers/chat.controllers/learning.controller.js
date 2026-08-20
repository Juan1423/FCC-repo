'use strict';

const { learningService } = require('../../services/chat.services');

const listRevisiones = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'pendiente' } = req.query;
        const result = await learningService.listPendingRevisions({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });
        res.json({
            success: true,
            data: result.rows,
            count: result.count,
            pagination: { page: parseInt(page), limit: parseInt(limit) },
        });
    } catch (error) {
        console.error('Error listing revisiones:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const approveRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const { respuesta_canonica, patron_trigger } = req.body;
        const adminId = req.user?.user;

        if (!respuesta_canonica) {
            return res.status(400).json({ success: false, message: 'respuesta_canonica es requerida' });
        }

        const canonica = await learningService.approveRevision({
            idRevision: parseInt(id),
            respuestaCanonica: respuesta_canonica,
            patronTrigger: patron_trigger || null,
            adminId,
        });
        res.json({ success: true, data: canonica, message: 'Revisión aprobada y respuesta canónica creada' });
    } catch (error) {
        console.error('Error approving revision:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const rejectRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.user;
        const revision = await learningService.rejectRevision({
            idRevision: parseInt(id),
            adminId,
        });
        res.json({ success: true, data: revision, message: 'Revisión rechazada' });
    } catch (error) {
        console.error('Error rejecting revision:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCanonicas = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const rows = await models.ChatRespuestaCanonica.findAll({
            where: { activo: true },
            order: [['prioridad', 'DESC'], ['usos_count', 'DESC']],
        });
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCanonicaById = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { id } = req.params;
        const row = await models.ChatRespuestaCanonica.findByPk(id);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Respuesta canónica no encontrada' });
        }
        res.json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createCanonica = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { patron_trigger, respuesta_canonica, categoria, prioridad } = req.body;
        const adminId = req.user?.user;

        if (!patron_trigger || !respuesta_canonica) {
            return res.status(400).json({ success: false, message: 'patron_trigger y respuesta_canonica son requeridos' });
        }

        let embedding_trigger = null;
        try {
            embedding_trigger = await learningService.ragService.generateEmbedding(patron_trigger);
            embedding_trigger = JSON.stringify(embedding_trigger);
        } catch (e) {
            console.warn('Could not generate embedding for trigger:', e.message);
        }

        const row = await models.ChatRespuestaCanonica.create({
            patron_trigger,
            embedding_trigger,
            respuesta_canonica,
            categoria,
            prioridad: prioridad || 1,
            activo: true,
            creado_por: adminId,
        });
        learningService.ragService.invalidateCache();
        res.status(201).json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCanonica = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { id } = req.params;
        const { patron_trigger, respuesta_canonica, categoria, prioridad, activo } = req.body;

        const row = await models.ChatRespuestaCanonica.findByPk(id);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Respuesta canónica no encontrada' });
        }

        if (patron_trigger !== undefined) row.patron_trigger = patron_trigger;
        if (respuesta_canonica !== undefined) row.respuesta_canonica = respuesta_canonica;
        if (categoria !== undefined) row.categoria = categoria;
        if (prioridad !== undefined) row.prioridad = prioridad;
        if (activo !== undefined) row.activo = activo;

        await row.save();
        learningService.ragService.invalidateCache();
        res.json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCanonica = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { id } = req.params;
        const deleted = await models.ChatRespuestaCanonica.destroy({ where: { id_canonica: id } });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Respuesta canónica no encontrada' });
        }
        res.json({ success: true, message: 'Respuesta canónica eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await learningService.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    listRevisiones,
    approveRevision,
    rejectRevision,
    getAllCanonicas,
    getCanonicaById,
    createCanonica,
    updateCanonica,
    deleteCanonica,
    getStats,
};
