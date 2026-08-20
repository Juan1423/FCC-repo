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
        const { page = 1, limit = 10, tema_principal, estado_vigencia, nivel_prioridad, bloqueado } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (tema_principal) where.tema_principal = tema_principal;
        if (estado_vigencia !== undefined) where.estado_vigencia = estado_vigencia === 'true';
        if (nivel_prioridad) where.nivel_prioridad = parseInt(nivel_prioridad);
        if (bloqueado !== undefined) where.bloqueado = bloqueado === 'true';

        const rows = await knowledgeService.findAll({ limit: parseInt(limit), offset, where });
        res.json({
            success: true,
            data: rows,
            pagination: { page: parseInt(page), limit: parseInt(limit) },
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
        const { titulo = req.file.originalname } = req.body;
        const result = await knowledgeService.ingestirDocumento(req.file, titulo);
        res.status(201).json({ success: true, data: result, message: 'Documento procesado exitosamente' });
    } catch (error) {
        console.error('Error uploading documento:', error.message);
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
                console.error('Background embedding error:', error.message);
            }
        });
        res.json({ success: true, message: 'Generación de embeddings iniciada en segundo plano' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const regenerarMemoria = async (req, res) => {
    try {
        setImmediate(async () => {
            try {
                const result = await knowledgeService.regenerarMemoria();
            } catch (error) {
                console.error('Background regenerarMemoria error:', error.message);
            }
        });
        res.json({ success: true, message: 'Regeneración de memoria iniciada en segundo plano' });
    } catch (error) {
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

const usarConocimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { mensaje } = req.body;
        const conocimiento = await knowledgeService.findById(id);
        if (!conocimiento) {
            return res.status(404).json({ success: false, message: 'Conocimiento no encontrado' });
        }
        res.json({ success: true, message: 'Endpoint de prueba - conocimiento válido', data: { conocimiento } });
    } catch (error) {
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
    usarConocimiento,
};
