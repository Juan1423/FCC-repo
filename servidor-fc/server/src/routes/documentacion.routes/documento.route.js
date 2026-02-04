const express = require('express');
const router = express.Router();
const documentoController = require('../../controllers/documentacion.controllers/documento.controller');

router
    .get('/', documentoController.get)
    .get('/:id', documentoController.getById)
    .post('/', documentoController.create)
    .put('/:id', documentoController.update)
    .delete('/:id', documentoController._delete);

module.exports = router;
