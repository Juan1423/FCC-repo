const express = require('express');
const router = express.Router();
const tipoEmpleadoController = require('../../controllers/donaciones.controllers/tipo_empleado.controller');

router
    .get('/', tipoEmpleadoController.get)
    .get('/:id', tipoEmpleadoController.getById)
    .post('/', tipoEmpleadoController.create)
    .put('/:id', tipoEmpleadoController.update)
    .delete('/:id', tipoEmpleadoController._delete);

module.exports = router;
