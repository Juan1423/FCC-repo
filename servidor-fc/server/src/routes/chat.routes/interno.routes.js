'use strict';

const express = require('express');
const router = express.Router();
const { enviarMensaje, listarHistorial, exportarCSV, enviarFeedback } = require('../../controllers/chat.controllers/interno.controller');
const { verifyToken, requireRole } = require('../../middleware/verifyToken');

router.post('/mensaje', verifyToken, requireRole(['admin', 'personal_salud']), enviarMensaje);
router.post('/feedback', verifyToken, requireRole(['admin', 'personal_salud']), enviarFeedback);
router.get('/historial', verifyToken, requireRole(['admin', 'personal_salud']), listarHistorial);
router.get('/historial/reporte', verifyToken, requireRole(['admin', 'personal_salud']), exportarCSV);

module.exports = router;
