const express = require('express');
const router = express.Router();
const detalleDonacionController = require('../../controllers/donaciones.controllers/detalle_donacion.controller');

router
    .get('/', detalleDonacionController.get)
    .get('/:id', detalleDonacionController.getById)
    .post('/', detalleDonacionController.create)
    .put('/:id', detalleDonacionController.update)
    .delete('/:id', detalleDonacionController._delete);

module.exports = router;
