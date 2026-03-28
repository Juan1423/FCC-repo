const express = require('express');
const router = express.Router();
const { create, getAll, getById, update, remove, activate, uploadPdf, downloadPdf, executeSelected, checkPdfExists } = require('../../controllers/chatcliente.controllers/prompt.controller');
const { verifyToken } = require('../../middleware/verifyToken');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET routes (específico antes de genérico)
router.get('/', verifyToken, getAll);
router.get('/check/:pdfName', verifyToken, checkPdfExists);
router.get('/download/:pdfName', verifyToken, downloadPdf);
router.get('/:id', verifyToken, getById);

// POST routes (específicas ANTES de dinámicas)
router.post('/execute-selected', verifyToken, executeSelected);
router.post('/', verifyToken, upload.single('pdf'), create);
router.post('/upload-pdf', verifyToken, upload.single('file'), uploadPdf);
router.post('/:id/activate', verifyToken, activate);

// PUT and DELETE routes
router.put('/:id', verifyToken, upload.single('pdf'), update);
router.delete('/:id', verifyToken, remove);

module.exports = router;