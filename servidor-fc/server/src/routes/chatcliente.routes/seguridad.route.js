'use strict';

const express = require('express');
const router = express.Router();
const seguridadController = require('../../controllers/chatcliente.controllers/seguridad.controller');
const { verifyToken, verifyTokenAdmin } = require('../../middleware/verifyToken');

// Rutas para gestión de seguridad
// Solo admin puede ver y gestionar registros de seguridad
router.post('/', verifyTokenAdmin, seguridadController.create);
router.get('/', verifyTokenAdmin, seguridadController.getAll);
router.get('/:id', verifyTokenAdmin, seguridadController.getById);
router.put('/:id', verifyTokenAdmin, seguridadController.update);
router.delete('/:id', verifyTokenAdmin, seguridadController.delete);

// Estadísticas (solo admin)
router.get('/stats', verifyTokenAdmin, seguridadController.getStats);

// Bloquear / desbloquear por IP (solo admin)
router.post('/block-ip', verifyTokenAdmin, seguridadController.blockIp);
router.post('/unblock-ip', verifyTokenAdmin, seguridadController.unblockIp);

module.exports = router;