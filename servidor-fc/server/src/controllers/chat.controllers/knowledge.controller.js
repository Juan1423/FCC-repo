'use strict';

const { knowledgeService } = require('../../services/chat.services');

const create = async (req, res) => {
    try {
        const data = req.body;
        const conocimiento = await knowledgeService.create(data);
        res.status(201).json({
            success: true,
            data: conocimiento,
            message: 'Conocimiento creado exitosamente',
        });
    } catch (error) {
        console.error('Error creating conocimiento:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, tipo, tema_principal, estado_vigencia, nivel_prioridad, bloqueado } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (tipo) where.tipo = tipo;
        if (tema_principal) where.tema_principal = tema_principal;
        if (estado_vigencia !== undefined) where.estado_vigencia = estado_vigencia === 'true';
        if (nivel_prioridad) where.nivel_prioridad = parseInt(nivel_prioridad);
        if (bloqueado !== undefined) where.bloqueado = bloqueado === 'true';

        const rows = await knowledgeService.findAll({ limit: parseInt(limit), offset, where });
        const { models } = require('../../libs/sequelize');
        const total = await models.ChatConocimiento.count({ where });
        res.json({
            success: true,
            data: rows,
            pagination: { page: parseInt(page), limit: parseInt(limit), total },
        });
    } catch (error) {
        console.error('Error getting conocimiento:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const conocimiento = await knowledgeService.findById(id);
        if (!conocimiento) {
            return res.status(404).json({ success: false, message: 'Conocimiento no encontrado' });
        }
        res.json({ success: true, data: conocimiento });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const conocimiento = await knowledgeService.update(id, data);
        if (!conocimiento) {
            return res.status(404).json({ success: false, message: 'Conocimiento no encontrado' });
        }
        res.json({ success: true, data: conocimiento });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await knowledgeService.delete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Conocimiento no encontrado' });
        }
        res.json({ success: true, message: 'Conocimiento eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const toggleBloqueo = async (req, res) => {
    try {
        const { id } = req.params;
        const conocimiento = await knowledgeService.toggleBloqueo(id);
        if (!conocimiento) {
            return res.status(404).json({ success: false, message: 'Conocimiento no encontrado' });
        }
        res.json({ success: true, data: conocimiento });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const uploadDocumento = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Archivo PDF requerido' });
        }
        const { titulo = req.file.originalname, canal = 'ambos' } = req.body;
        if (!['ambos', 'publico', 'interno'].includes(canal)) {
            return res.status(400).json({ success: false, message: 'canal inválido. Valores: ambos, publico, interno' });
        }
        const result = await knowledgeService.ingestirDocumento(req.file, titulo, canal);
        res.status(201).json({ success: true, data: result, message: 'Documento procesado exitosamente' });
    } catch (error) {
        console.error('Error uploading documento:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const generateEmbeddings = async (req, res) => {
    try {
        const { ids } = req.body;
        setImmediate(async () => {
            try {
                const result = await knowledgeService.generarEmbeddings(ids);
            } catch (error) {
                console.error('Background embedding error:', error);
            }
        });
        res.json({ success: true, message: 'Generación de embeddings iniciada en segundo plano' });
    } catch (error) {
        console.error('Error starting embeddings generation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const regenerarMemoria = async (req, res) => {
    try {
        setImmediate(async () => {
            try {
                const result = await knowledgeService.regenerarMemoria();
            } catch (error) {
                console.error('Background regenerarMemoria error:', error);
            }
        });
        res.json({ success: true, message: 'Regeneración de memoria iniciada en segundo plano' });
    } catch (error) {
        console.error('Error starting memory regeneration:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const bloquearTodos = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await knowledgeService.bloquearTodos(ids);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const desbloquearTodos = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await knowledgeService.desbloquearTodos(ids);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const ejecutarBloqueadas = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await knowledgeService.ejecutarBloqueadas(ids);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllDocumentos = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (estado) where.estado = estado;

        const rows = await knowledgeService.findAllDocumentos({ limit: parseInt(limit), offset, where });
        const total = await knowledgeService.countDocumentos(where);
        res.json({
            success: true,
            data: rows.map((d) => ({
                id_documento: d.id_documento,
                titulo: d.titulo,
                nombre_archivo: d.nombre_archivo,
                tipo_mime: d.tipo_mime,
                estado: d.estado,
                chunks_count: d.chunks_count,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                segmentos_bloqueados: (d.conocimientos || []).filter((c) => c.bloqueado).length,
            })),
            pagination: { page: parseInt(page), limit: parseInt(limit), total },
        });
    } catch (error) {
        console.error('Error getting documentos:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await knowledgeService.deleteDocumento(id);
        if (result === null) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        res.json({ success: true, message: 'Documento y sus segmentos eliminados' });
    } catch (error) {
        console.error('Error deleting documento:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const bloquearDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await knowledgeService.toggleBloqueoDocumento(id, true);
        if (affected === null) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        res.json({ success: true, message: `Documento bloqueado (${affected} segmentos)` });
    } catch (error) {
        console.error('Error blocking documento:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const desbloquearDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await knowledgeService.toggleBloqueoDocumento(id, false);
        if (affected === null) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        res.json({ success: true, message: `Documento desbloqueado (${affected} segmentos)` });
    } catch (error) {
        console.error('Error unblocking documento:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: deleteItem,
    toggleBloqueo,
    uploadDocumento,
    generateEmbeddings,
    regenerarMemoria,
    bloquearTodos,
    desbloquearTodos,
    ejecutarBloqueadas,
    getAllDocumentos,
    deleteDocumento,
    bloquearDocumento,
    desbloquearDocumento,
};
