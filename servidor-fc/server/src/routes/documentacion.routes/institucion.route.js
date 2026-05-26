const express = require('express');
const router = express.Router();
const controller = require('../../controllers/documentacion.controllers/institucion.controller');
const { uploadInstitucion } = require('../../utils/multerConfigDocumentacion');

router
    .get('/', controller.get)
    .get('/:id', controller.getById)
    .post('/', uploadInstitucion.single('archivo_institucion'), controller.create)
    .put('/:id', uploadInstitucion.single('archivo_institucion'), controller.update)
    .delete('/:id', controller._delete);

module.exports = router;
