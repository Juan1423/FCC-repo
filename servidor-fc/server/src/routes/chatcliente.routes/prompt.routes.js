const express = require('express');
const { create, getAll, getById, update, remove, activate, clearMemory, uploadPdf } = require('../controllers/prompt.controller');
const { verifyToken } = require('../../middleware/verifyToken');
const multer = require('multer');

const router = express.Router();
const upload = multer();

// Rutas estáticas PRIMERO (antes de :id dinámico)
router.post('/clear-memory', verifyToken, clearMemory);
router.post('/upload-pdf', verifyToken, upload.single('pdf'), uploadPdf);

// Rutas generales
router.get('/', verifyToken, getAll);
router.post('/', verifyToken, upload.single('pdf'), create);

// Rutas dinámicas DESPUÉS (:id coincidiría con cualquier cosa)
router.get('/:id', verifyToken, getById);
router.put('/:id', verifyToken, upload.single('pdf'), update);
router.delete('/:id', verifyToken, remove);
router.post('/:id/activate', verifyToken, activate);

module.exports = router;