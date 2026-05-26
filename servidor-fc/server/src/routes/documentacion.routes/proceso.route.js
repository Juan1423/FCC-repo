const express = require('express');
const router = express.Router();
const controller = require('../../controllers/documentacion.controllers/proceso.controller');
const { uploadProceso } = require('../../utils/multerConfigDocumentacion');

router
    .get('/', controller.get)
    .get('/:id', controller.getById)
    .post('/', uploadProceso.single('archivo_proceso'), controller.create)
    .put('/:id', uploadProceso.single('archivo_proceso'), controller.update)
    .delete('/:id', controller._delete);

module.exports = router;
