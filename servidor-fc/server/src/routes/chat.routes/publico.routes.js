'use strict';

const express = require('express');
const router = express.Router();
const {
    enviarMensaje,
    enviarFeedback,
    registrarAnonimo,
    crearPreguntaAnonima,
} = require('../../controllers/chat.controllers/publico.controller');
const { verifyTokenOrVisitor } = require('../../middleware/verifyToken');

router.post('/mensaje', verifyTokenOrVisitor, enviarMensaje);
router.post('/feedback', verifyTokenOrVisitor, enviarFeedback);
router.post('/usuario-anonimo/register', registrarAnonimo);
router.post('/pregunta-anonima', crearPreguntaAnonima);

module.exports = router;
