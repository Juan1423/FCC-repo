'use strict';

const express = require('express');
const router = express.Router();
const preguntaAnonimaController = require('../../controllers/chatcliente.controllers/pregunta_anonima.controller');
const { verifyTokenAdmin } = require('../../middleware/verifyToken');

// Rutas para gestión de preguntas anónimas
// Crear pregunta (público, para que usuarios anónimos puedan enviar preguntas)
router.post('/', preguntaAnonimaController.create);

// Rutas protegidas (solo admin)
router.get('/', verifyTokenAdmin, preguntaAnonimaController.getAll);
router.get('/:id', verifyTokenAdmin, preguntaAnonimaController.getById);
router.get('/cedula/:cedula', verifyTokenAdmin, preguntaAnonimaController.getByCedula);

// Estadísticas (solo admin)
router.get('/stats', verifyTokenAdmin, preguntaAnonimaController.getStats);

module.exports = router;