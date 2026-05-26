const express = require('express');
const router = express.Router();
const controller = require('../../controllers/documentacion.controllers/indicador.controller');
const { uploadIndicador } = require('../../utils/multerConfigDocumentacion');

router
    .get('/', controller.get)
    .get('/:id', controller.getById)
    .post('/', uploadIndicador.single('archivo_indicador'), controller.create)
    .put('/:id', uploadIndicador.single('archivo_indicador'), controller.update)
    .delete('/:id', controller._delete);

module.exports = router;
