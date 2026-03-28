const express = require('express');
const router = express.Router();
const controller = require('../../controllers/chatservidor.controllers/bot_interno.controller');
const upload = require('../../utils/multerConfigIA'); // Asegúrate que este apunte a tu config de Multer

// Prefijo: /api/fcc/chatservidor/asistente

router.post('/upload-conocimiento', upload.single('archivo'), controller.subirDocumento);
router.post('/consultar', controller.consultarAsistente);

module.exports = router;