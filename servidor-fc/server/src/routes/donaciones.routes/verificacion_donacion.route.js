const express = require('express');
const router = express.Router();
const verificacionDonacionController = require('../../controllers/donaciones.controllers/verificacion_donacion.controller');

router
    .get('/', verificacionDonacionController.get)
    .get('/:id', verificacionDonacionController.getById)
    .post('/', verificacionDonacionController.create)
    .put('/:id', verificacionDonacionController.update)
    .delete('/:id', verificacionDonacionController._delete);

module.exports = router;
