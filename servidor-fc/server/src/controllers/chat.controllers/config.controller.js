'use strict';

const { configService, guardrailsService, learningService, openaiService } = require('../../services/chat.services');

const getConfig = async (req, res) => {
    try {
        const config = await configService.getConfig();
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error getting config:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateConfig = async (req, res) => {
    try {
        const { clave, valor } = req.body;
        if (!clave) {
            return res.status(400).json({ success: false, message: 'clave es requerida' });
        }

        const result = await configService.update(clave, valor);
        guardrailsService.invalidateCache && guardrailsService.invalidateCache();
        learningService.invalidateCache && learningService.invalidateCache();
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating config:', error.message);
        if (error.code === 'CONFIG_VALIDATION') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFundacionConfig = async (req, res) => {
    try {
        const perfil = await configService.getFundacion();
        res.json({ success: true, data: perfil });
    } catch (error) {
        console.error('Error getting fundacion config:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateFundacionConfig = async (req, res) => {
    try {
        const { perfil } = req.body;
        if (!perfil || typeof perfil !== 'object') {
            return res.status(400).json({ success: false, message: 'perfil es requerido' });
        }

        const result = await configService.updateFundacion(perfil);
        configService.invalidate();
        guardrailsService.invalidateCache && guardrailsService.invalidateCache();
        learningService.invalidateCache && learningService.invalidateCache();
        openaiService.invalidateConfig && openaiService.invalidateConfig();
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating fundacion config:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProtocolosSensibles = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const rows = await models.ChatProtocoloSensible.findAll({
            order: [['prioridad', 'ASC']],
        });
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProtocoloSensible = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { id } = req.params;
        const updateData = req.body;

        const row = await models.ChatProtocoloSensible.findByPk(id);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Protocolo no encontrado' });
        }

        await row.update(updateData);
        guardrailsService.invalidateCache && guardrailsService.invalidateCache();
        res.json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createProtocoloSensible = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const row = await models.ChatProtocoloSensible.create(req.body);
        guardrailsService.invalidateCache && guardrailsService.invalidateCache();
        res.json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProtocoloSensible = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { id } = req.params;
        const row = await models.ChatProtocoloSensible.findByPk(id);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Protocolo no encontrado' });
        }
        await row.update({ activo: false });
        guardrailsService.invalidateCache && guardrailsService.invalidateCache();
        res.json({ success: true, message: 'Protocolo desactivado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getConfig,
    updateConfig,
    getFundacionConfig,
    updateFundacionConfig,
    getProtocolosSensibles,
    updateProtocoloSensible,
    createProtocoloSensible,
    deleteProtocoloSensible,
};
