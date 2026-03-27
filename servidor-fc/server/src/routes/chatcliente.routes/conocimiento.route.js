'use strict';

const express = require('express');
const router = express.Router();
const conocimientoController = require('../../controllers/chatcliente.controllers/conocimiento.controller');
const { verifyToken, verifyTokenAdmin } = require('../../middleware/verifyToken');

// Rutas para gestión de conocimientos de IA
// Solo admin puede crear, actualizar, eliminar
router.post('/', verifyTokenAdmin, conocimientoController.create);
router.get('/', verifyToken, conocimientoController.getAll); // Usuarios autenticados pueden ver
router.get('/:id', verifyToken, conocimientoController.getById);
router.put('/:id', verifyTokenAdmin, conocimientoController.update);
router.delete('/:id', verifyTokenAdmin, conocimientoController.delete);

// Rutas específicas
router.get('/tema/:tema', verifyToken, conocimientoController.getByTema);
router.patch('/:id/toggle-vigencia', verifyTokenAdmin, conocimientoController.toggleVigencia);
router.patch('/:id/toggle-bloqueo', verifyTokenAdmin, conocimientoController.toggleBloqueo);
router.post('/bloquear-todos', verifyTokenAdmin, conocimientoController.bloquearTodos);
router.post('/desbloquear-todos', verifyTokenAdmin, conocimientoController.desbloquearTodos);
router.post('/ejecutar-bloqueadas', verifyTokenAdmin, conocimientoController.ejecutarBloqueadas);
router.get('/meta/temas', verifyToken, conocimientoController.getTemas);
router.get('/search/pregunta', verifyToken, conocimientoController.searchPregunta);
router.post('/generate-embeddings', verifyTokenAdmin, conocimientoController.generateEmbeddings);
router.post('/regenerar-memoria', verifyTokenAdmin, conocimientoController.regenerarMemoria);
router.post('/usar-conocimiento/:id', verifyToken, conocimientoController.usarConocimientoEspecifico);

module.exports = router;