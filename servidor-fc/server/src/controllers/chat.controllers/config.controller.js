'use strict';

const { configService, guardrailsService } = require('../../services/chat.services');

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
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating config:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTemasValidos = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const rows = await models.ChatTemaValido.findAll({
            where: { activo: true },
            order: [['id_tema', 'ASC']],
        });
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const regenerarTemas = async (req, res) => {
    try {
        const { models } = require('../../libs/sequelize');
        const { OpenAI } = require('openai');
        const chatConfig = require('../../config/chatConfig');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const temas = await models.ChatTemaValido.findAll({
            where: { activo: true },
            attributes: ['id_tema', 'tema', 'descripcion', 'embedding'],
        });

        let generated = 0;
        let errors = 0;

        for (const tema of temas) {
            try {
                if (tema.embedding) {
                    let parsed = null;
                    try { parsed = JSON.parse(tema.embedding); } catch (e) {}
                    if (parsed) {
                        generated++;
                        continue;
                    }
                }

                const textToEmbed = tema.descripcion || tema.tema;
                const response = await openai.embeddings.create({
                    model: chatConfig.embeddingModel,
                    input: textToEmbed.substring(0, 8000),
                });
                await models.ChatTemaValido.update(
                    { embedding: JSON.stringify(response.data[0].embedding) },
                    { where: { id_tema: tema.id_tema } }
                );
                generated++;
            } catch (e) {
                console.error(`Error generating embedding for tema ${tema.id_tema}:`, e.message);
                errors++;
            }
            await new Promise(r => setTimeout(r, 150));
        }

        guardrailsService.invalidateCache && guardrailsService.invalidateCache();
        res.json({ success: true, message: `Generados ${generated} embeddings, ${errors} errores` });
    } catch (error) {
        console.error('Error regenerando temas:', error.message);
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
    getTemasValidos,
    regenerarTemas,
    getProtocolosSensibles,
    updateProtocoloSensible,
    createProtocoloSensible,
    deleteProtocoloSensible,
};
