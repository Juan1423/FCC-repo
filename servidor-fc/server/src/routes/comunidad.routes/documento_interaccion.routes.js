const express = require('express');
const router = express.Router();
const controller = require('../../controllers/comunidad.controllers/documento_interaccion.controller');
const upload = require('../../utils/multerConfigDocumentos');
const { validateUploadedFileSignatures } = require('../../utils/fileSignature');

// Prefijo para poner en index.routes: /comunidad/documentos

router.get('/interaccion/:interaccionId', controller.getByInteraccion);

router.post('/interaccion/:interaccionId', 
    upload.single('file'),
    validateUploadedFileSignatures,
    controller.create
);

router.delete('/:id', controller.deleteDoc);

router.get('/download/:filename', controller.downloadFile);

module.exports = router;