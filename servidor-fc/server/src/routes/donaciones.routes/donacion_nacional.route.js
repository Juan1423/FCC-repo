const express = require('express');
const router = express.Router();
const donacionNacionalController = require('../../controllers/donaciones.controllers/donacion_nacional.controller');

router
    .get('/', donacionNacionalController.get)
    .get('/:id', donacionNacionalController.getById)
    .post('/', donacionNacionalController.create)
    .put('/:id', donacionNacionalController.update)
    .delete('/:id', donacionNacionalController._delete);

module.exports = router;
