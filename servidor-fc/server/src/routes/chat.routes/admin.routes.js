'use strict';

const express = require('express');
const router = express.Router();
const { verifyTokenAdmin, requireRole } = require('../../middleware/verifyToken');
const multer = require('multer');
const adminController = require('../../controllers/chat.controllers/admin.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/prompts', verifyTokenAdmin, adminController.getAllPrompts);
router.post('/prompts', verifyTokenAdmin, upload.single('pdf'), adminController.createPrompt);
router.get('/prompts/:id', verifyTokenAdmin, adminController.getById);
router.put('/prompts/:id', verifyTokenAdmin, upload.single('pdf'), adminController.updatePrompt);
router.delete('/prompts/:id', verifyTokenAdmin, adminController.deletePrompt);
router.post('/prompts/:id/activate', verifyTokenAdmin, adminController.activatePrompt);
router.post('/prompts/upload-pdf', verifyTokenAdmin, upload.single('file'), adminController.uploadPromptPdf);
router.get('/prompts/download/:archivo', verifyTokenAdmin, adminController.downloadPromptPdf);

router.get('/usuarios-anonimos', verifyTokenAdmin, adminController.getAllUsuariosAnonimos);
router.put('/usuarios-anonimos/:id', verifyTokenAdmin, adminController.updateUsuarioAnonimo);
router.delete('/usuarios-anonimos/:id', verifyTokenAdmin, adminController.deleteUsuarioAnonimo);
router.post('/usuarios-anonimos/:id/block', verifyTokenAdmin, adminController.blockUsuarioAnonimo);
router.post('/usuarios-anonimos/:id/unblock', verifyTokenAdmin, adminController.unblockUsuarioAnonimo);

router.get('/preguntas-anonimas', verifyTokenAdmin, adminController.getAllPreguntasAnonimas);

router.get('/conversaciones', verifyTokenAdmin, adminController.getAllConversaciones);
router.put('/conversaciones/:id', verifyTokenAdmin, adminController.updateConversacion);
router.delete('/conversaciones/:id', verifyTokenAdmin, adminController.deleteConversacion);
router.post('/conversaciones/:id/usar-conversacion', verifyTokenAdmin, adminController.usarConversacionEspecifica);
router.get('/stats', verifyTokenAdmin, adminController.getStats);

router.post('/seguridad/block-user', verifyTokenAdmin, adminController.blockRegisteredUser);
router.post('/seguridad/unblock-user', verifyTokenAdmin, adminController.unblockRegisteredUser);
router.post('/seguridad/block-ip', verifyTokenAdmin, adminController.blockIp);
router.post('/seguridad/unblock-ip', verifyTokenAdmin, adminController.unblockIp);

router.get('/rate-limit-logs', verifyTokenAdmin, adminController.getRateLimitLogs);
router.post('/rate-limit/clear', verifyTokenAdmin, adminController.clearRateLimit);

module.exports = router;
