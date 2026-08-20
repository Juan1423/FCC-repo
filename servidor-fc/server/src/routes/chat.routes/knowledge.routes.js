'use strict';

const express = require('express');
const router = express.Router();
const { verifyTokenAdmin } = require('../../middleware/verifyToken');
const multer = require('multer');
const knowledgeController = require('../../controllers/chat.controllers/knowledge.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyTokenAdmin, knowledgeController.getAll);
router.post('/', verifyTokenAdmin, knowledgeController.create);
router.get('/stats', verifyTokenAdmin, getStats);

router.put('/:id', verifyTokenAdmin, knowledgeController.update);
router.delete('/:id', verifyTokenAdmin, knowledgeController.delete);
router.patch('/:id/toggle-bloqueo', verifyTokenAdmin, knowledgeController.toggleBloqueo);

router.post('/upload-documento', verifyTokenAdmin, upload.single('pdf'), knowledgeController.uploadDocumento);
router.post('/generate-embeddings', verifyTokenAdmin, knowledgeController.generateEmbeddings);
router.post('/regenerar-memoria', verifyTokenAdmin, knowledgeController.regenerarMemoria);
router.post('/bloquear-todos', verifyTokenAdmin, knowledgeController.bloquearTodos);
router.post('/desbloquear-todos', verifyTokenAdmin, knowledgeController.desbloquearTodos);
router.post('/ejecutar-bloqueadas', verifyTokenAdmin, knowledgeController.ejecutarBloqueadas);
router.post('/:id/usar-conocimiento', verifyTokenAdmin, knowledgeController.usarConocimiento);

router.get('/:id', verifyTokenAdmin, knowledgeController.getById);

async function getStats(req, res) {
    try {
        const { models } = require('../../libs/sequelize');
        const total = await models.ChatConocimiento.count();
        const bloqueados = await models.ChatConocimiento.count({ where: { bloqueado: true } });
        const vigentes = await models.ChatConocimiento.count({ where: { estado_vigencia: true } });
        const sinEmbedding = await models.ChatConocimiento.count({ where: { embedding: null } });
        res.json({ success: true, data: { total, bloqueados, vigentes, sinEmbedding } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = router;
