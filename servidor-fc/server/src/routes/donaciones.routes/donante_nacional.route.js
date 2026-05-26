const express = require('express');
const router = express.Router();
const donanteNacionalController = require('../../controllers/donaciones.controllers/donante_nacional.controller');

router
    .get('/', donanteNacionalController.get)
    .get('/:id', donanteNacionalController.getById)
    .post('/', donanteNacionalController.create)
    .put('/:id', donanteNacionalController.update)
    .delete('/:id', donanteNacionalController._delete);

module.exports = router;
