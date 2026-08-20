'use strict';

const express = require('express');
const router = express.Router();
const { verifyTokenAdmin } = require('../../middleware/verifyToken');
const learningController = require('../../controllers/chat.controllers/learning.controller');

router.get('/revisiones', verifyTokenAdmin, learningController.listRevisiones);
router.post('/revisiones/:id/aprobar', verifyTokenAdmin, learningController.approveRevision);
router.post('/revisiones/:id/rechazar', verifyTokenAdmin, learningController.rejectRevision);

router.get('/canonicas', verifyTokenAdmin, learningController.getAllCanonicas);
router.post('/canonicas', verifyTokenAdmin, learningController.createCanonica);
router.get('/canonicas/:id', verifyTokenAdmin, learningController.getCanonicaById);
router.put('/canonicas/:id', verifyTokenAdmin, learningController.updateCanonica);
router.delete('/canonicas/:id', verifyTokenAdmin, learningController.deleteCanonica);

router.get('/stats', verifyTokenAdmin, learningController.getStats);

module.exports = router;
