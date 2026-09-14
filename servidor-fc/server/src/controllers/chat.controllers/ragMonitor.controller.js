'use strict';

const { ragMonitorService } = require('../../services/chat.services');

const listarDiagnosticos = async (req, res) => {
    try {
        const { page = 1, limit = 20, soloSospechosos, tipo, modelo, flag } = req.query;
        const result = await ragMonitorService.listar({
            page: parseInt(page),
            limit: parseInt(limit),
            soloSospechosos,
            tipo: tipo || null,
            modelo: modelo || null,
            flag: flag || null,
        });
        res.json({
            success: true,
            data: result.rows,
            count: result.count,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(result.count / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error listando diagnósticos RAG:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await ragMonitorService.stats();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error obteniendo stats RAG monitor:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    listarDiagnosticos,
    getStats,
};