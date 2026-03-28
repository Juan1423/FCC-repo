const express = require('express');
const controller = require('../../controllers/chatservidor.controllers/historial_ia.controller');

const router = express.Router();

// Prefijo: /api/fcc/chatservidor/asistente
router.get('/historial', controller.listarHistorial);
router.get('/historial/reporte', controller.exportarHistorial);

module.exports = router; 