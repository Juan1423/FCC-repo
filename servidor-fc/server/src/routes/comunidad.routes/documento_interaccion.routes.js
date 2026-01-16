const express = require('express');
const router = express.Router();
const controller = require('../../controllers/comunidad.controllers/documento_interaccion.controller');
const upload = require('../../utils/multerConfigDocumentos');

// Prefijo para poner en index.routes: /comunidad/documentos

router.get('/interaccion/:interaccionId', controller.getByInteraccion);

router.post('/interaccion/:interaccionId', 
    upload.single('file'), 
    controller.create
);

router.delete('/:id', controller.deleteDoc);

router.get('/download/:filename', controller.downloadFile);

module.exports = router;