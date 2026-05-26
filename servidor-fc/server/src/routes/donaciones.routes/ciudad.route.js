const express = require('express');
const router = express.Router();
const ciudadController = require('../../controllers/donaciones.controllers/ciudad.controller');

router
    .get('/', ciudadController.get)
    .get('/:id', ciudadController.getById)
    .post('/', ciudadController.create)
    .put('/:id', ciudadController.update)
    .delete('/:id', ciudadController._delete);

module.exports = router;
