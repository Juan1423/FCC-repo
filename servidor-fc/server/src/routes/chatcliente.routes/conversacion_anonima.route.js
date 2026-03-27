'use strict';

const express = require('express');
const router = express.Router();
const conversacionAnonimaController = require('../../controllers/chatcliente.controllers/conversacion_anonima.controller');
const { verifyToken, verifyTokenAdmin } = require('../../middleware/verifyToken');

// Rutas para gestión de conversaciones anónimas
// Solo admin puede crear, actualizar, eliminar
router.post('/', verifyTokenAdmin, conversacionAnonimaController.create);
router.get('/', verifyTokenAdmin, conversacionAnonimaController.getAll);
router.get('/:id', verifyTokenAdmin, conversacionAnonimaController.getById);
router.put('/:id', verifyTokenAdmin, conversacionAnonimaController.update);
router.delete('/:id', verifyTokenAdmin, conversacionAnonimaController.delete);

// Rutas específicas
router.get('/usuario/:idUsuario', verifyTokenAdmin, conversacionAnonimaController.getByUsuario);
router.delete('/usuario/:idUsuario/clear', verifyTokenAdmin, conversacionAnonimaController.clearUserConversations);
router.get('/stats', verifyTokenAdmin, conversacionAnonimaController.getStats);

module.exports = router;