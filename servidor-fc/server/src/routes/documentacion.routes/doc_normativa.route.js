const express = require('express');
const router = express.Router();
const controller = require('../../controllers/documentacion.controllers/doc_normativa.controller');
const { uploadNormativa } = require('../../utils/multerConfigDocumentacion');

router
    .get('/', controller.get)
    .get('/:id', controller.getById)
    .post('/', uploadNormativa.single('archivo_normativa'), controller.create)
    .put('/:id', uploadNormativa.single('archivo_normativa'), controller.update)
    .delete('/:id', controller._delete);

module.exports = router;
