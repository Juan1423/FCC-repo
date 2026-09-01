'use strict';

const { promptsService, knowledgeService, guardrailsService } = require('../../services/chat.services');
const { Op } = require('sequelize');

const getAllPrompts = async (req, res) => {
    try {
        const { page = 1, limit = 10, tipo_prompt, activo } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (tipo_prompt) where.tipo_prompt = tipo_prompt;
        if (activo !== undefined) where.activo = activo === 'true';

        const prompts = await promptsService.findAll({
            limit: parseInt(limit),
            offset,
            where,
        });
        res.json({ success: true, data: prompts });
    } catch (error) {
        console.error('Error getting prompts:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const prompt = await promptsService.findById(id);
        if (!prompt) {
            return res.status(404).json({ success: false, message: 'Prompt no encontrado' });
        }
        res.json({ success: true, data: prompt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createPrompt = async (req, res) => {
    try {
        const { titulo, descripcion, instrucciones, tipo_prompt, activo } = req.body;
        const pdfFile = req.file || null;

        const prompt = await promptsService.create({
            titulo, descripcion, instrucciones, tipo_prompt, activo,
        }, pdfFile);

        res.status(201).json({ success: true, data: prompt, message: 'Prompt creado exitosamente' });
    } catch (error) {
        console.error('Error creating prompt:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, instrucciones, tipo_prompt, activo } = req.body;
        const pdfFile = req.file || null;

        const prompt = await promptsService.update(id, {
            titulo, descripcion, instrucciones, tipo_prompt, activo,
        }, pdfFile);

        if (!prompt) {
            return res.status(404).json({ success: false, message: 'Prompt no encontrado' });
        }
        res.json({ success: true, data: prompt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deletePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await promptsService.delete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Prompt no encontrado' });
        }
        res.json({ success: true, message: 'Prompt eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const activatePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const prompt = await promptsService.activate(id);
        if (!prompt) {
            return res.status(404).json({ success: false, message: 'Prompt no encontrado' });
        }
        res.json({ success: true, data: prompt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const uploadPromptPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Archivo PDF requerido' });
        }
        const result = await promptsService.uploadPdf(req.file);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error uploading PDF:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const downloadPromptPdf = async (req, res) => {
    try {
        const { archivo } = req.params;
        if (!archivo) {
            return res.status(400).json({ success: false, message: 'Nombre de archivo requerido' });
        }
        const result = await promptsService.downloadPdf(archivo);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }
        res.download(result.filePath, result.filename);
    } catch (error) {
        console.error('Error downloading PDF:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllUsuariosAnonimos = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { page = 1, limit = 10, estado } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (estado) where.estado = estado;

        const rows = await models.ChatUsuarioAnonimo.findAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['ultima_actividad', 'DESC']],
        });
        const count = await models.ChatUsuarioAnonimo.count({ where });

        res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUsuarioAnonimo = async (req, res) => {
    try {
        const { id } = req.params;
        const { models } = require('../../libs/sequelize');
        const { nombre, cedula, estado } = req.body;

        const usuario = await models.ChatUsuarioAnonimo.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (nombre !== undefined) usuario.nombre = nombre;
        if (cedula !== undefined) usuario.cedula = cedula;
        if (estado !== undefined) usuario.estado = estado;

        await usuario.save();
        res.json({ success: true, data: usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUsuarioAnonimo = async (req, res) => {
    try {
        const { id } = req.params;
        const { models } = require('../../libs/sequelize');
        const deleted = await models.ChatUsuarioAnonimo.destroy({ where: { id_usuario_anonimo: id } });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const blockUsuarioAnonimo = async (req, res) => {
    try {
        const { id } = req.params;
        const { models } = require('../../libs/sequelize');
        const usuario = await models.ChatUsuarioAnonimo.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        await usuario.update({ estado: 'bloqueado' });
        res.json({ success: true, data: usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const unblockUsuarioAnonimo = async (req, res) => {
    try {
        const { id } = req.params;
        const { models } = require('../../libs/sequelize');
        const usuario = await models.ChatUsuarioAnonimo.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        await usuario.update({ estado: 'activo' });
        res.json({ success: true, data: usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllPreguntasAnonimas = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { page = 1, limit = 10, cedula } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (cedula) where.cedula = cedula;

        const rows = await models.ChatPreguntaAnonima.findAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['fecha_pregunta', 'DESC']],
        });
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllConversaciones = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { page = 1, limit = 50, tipo } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (tipo) where.tipo = tipo;

        const rows = await models.ChatConversacion.findAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['fecha_conversacion', 'DESC']],
        });
        const count = await models.ChatConversacion.count({ where });

        res.json({
            success: true,
            data: rows,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { Sequelize } = require('sequelize');

        const totalConversaciones = await models.ChatConversacion.count();
        const totalPublicas = await models.ChatConversacion.count({ where: { tipo: 'publico' } });
        const totalInternas = await models.ChatConversacion.count({ where: { tipo: 'interno' } });
        const totalUsuariosAnonimos = await models.ChatUsuarioAnonimo.count();
        const totalPreguntasAnonimas = await models.ChatPreguntaAnonima.count();
        const totalTokens = await models.ChatConversacion.sum('tokens_usados') || 0;
        const revisionesPendientes = await models.ChatConversacionRevision.count({ where: { status: 'pendiente' } });

        res.json({
            success: true,
            data: {
                totalConversaciones,
                totalPublicas,
                totalInternas,
                totalUsuariosAnonimos,
                totalPreguntasAnonimas,
                totalTokens,
                revisionesPendientes,
            },
        });
    } catch (error) {
        console.error('Error getting stats:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRateLimitLogs = async (req, res) => {
    try {
        const logs = await guardrailsService.getRateLimitLogs();
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error getting rate limit logs:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const clearRateLimit = async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ success: false, message: 'identifier es requerido' });
        }
        await guardrailsService.clearRateLimit(identifier);
        res.json({ success: true, message: 'Rate limit limpiado para ' + identifier });
    } catch (error) {
        console.error('Error clearing rate limit:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateConversacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { models } = require('../../libs/sequelize');
        const conversacion = await models.ChatConversacion.findByPk(id);
        if (!conversacion) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
        }
        const { mensaje_usuario, respuesta_bot } = req.body;
        if (mensaje_usuario !== undefined) conversacion.mensaje_usuario = mensaje_usuario;
        if (respuesta_bot !== undefined) conversacion.respuesta_bot = respuesta_bot;
        await conversacion.save();
        res.json({ success: true, data: conversacion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteConversacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { models } = require('../../libs/sequelize');
        const deleted = await models.ChatConversacion.destroy({ where: { id_conversacion: id } });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
        }
        res.json({ success: true, message: 'Conversación eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const blockRegisteredUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'userId requerido' });
        const { models } = require('../../libs/sequelize');
        const user = await models.Usuario.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        await user.update({ estado: 'bloqueado' });
        res.json({ success: true, message: 'Usuario bloqueado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const unblockRegisteredUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'userId requerido' });
        const { models } = require('../../libs/sequelize');
        const user = await models.Usuario.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        await user.update({ estado: 'activo' });
        res.json({ success: true, message: 'Usuario desbloqueado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const blockIp = async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) return res.status(400).json({ success: false, message: 'ip requerida' });
        const blockedIPs = JSON.parse(process.env.BLOCKED_IPS || '[]');
        if (!blockedIPs.includes(ip)) blockedIPs.push(ip);
        process.env.BLOCKED_IPS = JSON.stringify(blockedIPs);
        res.json({ success: true, message: 'IP bloqueada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const unblockIp = async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) return res.status(400).json({ success: false, message: 'ip requerida' });
        let blockedIPs = JSON.parse(process.env.BLOCKED_IPS || '[]');
        blockedIPs = blockedIPs.filter(i => i !== ip);
        process.env.BLOCKED_IPS = JSON.stringify(blockedIPs);
        res.json({ success: true, message: 'IP desbloqueada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const usarConversacionEspecifica = async (req, res) => {
    try {
        const { id } = req.params;
        const { mensaje } = req.body;
        if (!mensaje) return res.status(400).json({ success: false, message: 'mensaje requerido' });
        const { models } = require('../../libs/sequelize');
        const conversacion = await models.ChatConversacion.findByPk(id);
        if (!conversacion) return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
        const { openaiService } = require('../../services/chat.services');
        const resultado = await openaiService.chatInterno({
            mensaje,
            idUsuario: req.user?.user || null,
            sessionId: `admin-usar-conv-${id}`,
        });
        res.json({ success: true, data: { respuesta: resultado.respuesta } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllPrompts,
    getById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    activatePrompt,
    uploadPromptPdf,
    downloadPromptPdf,
    getAllUsuariosAnonimos,
    updateUsuarioAnonimo,
    deleteUsuarioAnonimo,
    blockUsuarioAnonimo,
    unblockUsuarioAnonimo,
    getAllPreguntasAnonimas,
    getAllConversaciones,
    updateConversacion,
    deleteConversacion,
    blockRegisteredUser,
    unblockRegisteredUser,
    blockIp,
    unblockIp,
    usarConversacionEspecifica,
    getStats,
    getRateLimitLogs,
    clearRateLimit,
};
