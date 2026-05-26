const express = require('express');
const router = express.Router();
const donanteInternacionalController = require('../../controllers/donaciones.controllers/donante_internacional.controller');

router
    .get('/', donanteInternacionalController.get)
    .get('/:id', donanteInternacionalController.getById)
    .post('/', donanteInternacionalController.create)
    .put('/:id', donanteInternacionalController.update)
    .delete('/:id', donanteInternacionalController._delete);

module.exports = router;
