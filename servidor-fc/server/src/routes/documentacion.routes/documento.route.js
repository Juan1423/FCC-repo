const express = require('express');
const router = express.Router();
const documentoController = require('../../controllers/documentacion.controllers/documento.controller');
const { uploadDocumento } = require('../../utils/multerConfigDocumentacion');

router
    .get('/', documentoController.get)
    .get('/:id', documentoController.getById)
    .post('/', uploadDocumento.single('url_documento'), documentoController.create)
    .put('/:id', uploadDocumento.single('url_documento'), documentoController.update)
    .delete('/:id', documentoController._delete);

module.exports = router;
