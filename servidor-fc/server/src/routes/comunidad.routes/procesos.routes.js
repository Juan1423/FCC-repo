const express = require('express');
const router = express.Router();
const procesoController = require('../../controllers/comunidad.controllers/proceso.controller');

router
    .get('/', procesoController.get)
    .get('/:id', procesoController.getById)
    .post('/', procesoController.create)
    .put('/:id', procesoController.update)
    .delete('/:id', procesoController._delete);

module.exports = router;
