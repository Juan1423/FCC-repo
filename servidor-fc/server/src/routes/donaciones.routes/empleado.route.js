const express = require('express');
const router = express.Router();
const empleadoController = require('../../controllers/donaciones.controllers/empleado.controller');

router
    .get('/', empleadoController.get)
    .get('/:id', empleadoController.getById)
    .post('/', empleadoController.create)
    .put('/:id', empleadoController.update)
    .delete('/:id', empleadoController._delete);

module.exports = router;
