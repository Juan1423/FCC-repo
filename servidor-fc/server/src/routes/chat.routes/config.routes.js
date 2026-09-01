'use strict';

const express = require('express');
const router = express.Router();
const { verifyTokenAdmin } = require('../../middleware/verifyToken');
const configController = require('../../controllers/chat.controllers/config.controller');

router.get('/', verifyTokenAdmin, configController.getConfig);
router.put('/', verifyTokenAdmin, configController.updateConfig);

router.get('/temas', verifyTokenAdmin, configController.getTemasValidos);
router.post('/temas', verifyTokenAdmin, configController.createTemaValido);
router.put('/temas/:id', verifyTokenAdmin, configController.updateTemaValido);
router.delete('/temas/:id', verifyTokenAdmin, configController.deleteTemaValido);
router.post('/regenerar-temas', verifyTokenAdmin, configController.regenerarTemas);

router.get('/protocolos', verifyTokenAdmin, configController.getProtocolosSensibles);
router.post('/protocolos', verifyTokenAdmin, configController.createProtocoloSensible);
router.put('/protocolos/:id', verifyTokenAdmin, configController.updateProtocoloSensible);
router.delete('/protocolos/:id', verifyTokenAdmin, configController.deleteProtocoloSensible);

module.exports = router;
