'use strict';

const express = require('express');
const router = express.Router();
const {
    enviarMensaje,
    enviarFeedback,
    registrarAnonimo,
    crearPreguntaAnonima,
    getLimits,
} = require('../../controllers/chat.controllers/publico.controller');
const { verifyTokenOrVisitor } = require('../../middleware/verifyToken');

router.post('/mensaje', verifyTokenOrVisitor, enviarMensaje);
router.post('/feedback', verifyTokenOrVisitor, enviarFeedback);
router.post('/usuario-anonimo/register', registrarAnonimo);
router.post('/pregunta-anonima', crearPreguntaAnonima);
router.get('/config', verifyTokenOrVisitor, getLimits);

module.exports = router;
