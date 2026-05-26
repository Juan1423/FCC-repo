const express = require('express');
const router = express.Router();
const tipoOrganizacionController = require('../../controllers/donaciones.controllers/tipo_organizacion.controller');

router
    .get('/', tipoOrganizacionController.get)
    .get('/:id', tipoOrganizacionController.getById)
    .post('/', tipoOrganizacionController.create)
    .put('/:id', tipoOrganizacionController.update)
    .delete('/:id', tipoOrganizacionController._delete);

module.exports = router;
