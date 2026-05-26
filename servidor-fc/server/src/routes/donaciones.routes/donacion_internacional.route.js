const express = require('express');
const router = express.Router();
const donacionInternacionalController = require('../../controllers/donaciones.controllers/donacion_internacional.controller');

router
    .get('/', donacionInternacionalController.get)
    .get('/:id', donacionInternacionalController.getById)
    .post('/', donacionInternacionalController.create)
    .put('/:id', donacionInternacionalController.update)
    .delete('/:id', donacionInternacionalController._delete);

module.exports = router;
