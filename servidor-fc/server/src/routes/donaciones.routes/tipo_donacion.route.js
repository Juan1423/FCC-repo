const express = require('express');
const router = express.Router();
const tipoDonacionController = require('../../controllers/donaciones.controllers/tipo_donacion.controller');

router
    .get('/', tipoDonacionController.get)
    .get('/:id', tipoDonacionController.getById)
    .post('/', tipoDonacionController.create)
    .put('/:id', tipoDonacionController.update)
    .delete('/:id', tipoDonacionController._delete);

module.exports = router;
