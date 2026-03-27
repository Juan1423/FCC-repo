'use strict';

const express = require('express');
const router = express.Router();
const usuarioAnonimoController = require('../../controllers/chatcliente.controllers/usuario_anonimo.controller');
const { verifyToken, verifyTokenAdmin } = require('../../middleware/verifyToken');

// Rutas para gestión de usuarios anónimos
// Registro público (sin auth)
router.post('/register', usuarioAnonimoController.create);

// Rutas protegidas (solo admin)
router.get('/', verifyTokenAdmin, usuarioAnonimoController.getAll);
router.get('/:id', verifyTokenAdmin, usuarioAnonimoController.getById);
router.get('/cedula/:cedula', verifyTokenAdmin, usuarioAnonimoController.getByCedula);
router.put('/:id', verifyTokenAdmin, usuarioAnonimoController.update);
router.post('/:id/block', verifyTokenAdmin, usuarioAnonimoController.block);
router.post('/:id/unblock', verifyTokenAdmin, usuarioAnonimoController.unblock);
router.patch('/:id/actividad', verifyTokenAdmin, usuarioAnonimoController.updateUltimaActividad);
router.delete('/:id', verifyTokenAdmin, usuarioAnonimoController.delete);

// Estadísticas (solo admin)
router.get('/stats', verifyTokenAdmin, usuarioAnonimoController.getStats);

module.exports = router;