const express = require('express');
const router = express.Router();
const tipoDonanteController = require('../../controllers/donaciones.controllers/tipo_donante.controller');

router
    .get('/', tipoDonanteController.get)
    .get('/:id', tipoDonanteController.getById)
    .post('/', tipoDonanteController.create)
    .put('/:id', tipoDonanteController.update)
    .delete('/:id', tipoDonanteController._delete);

module.exports = router;
