const express = require('express');
const router = express.Router();
const parroquiaController = require('../../controllers/donaciones.controllers/parroquia.controller');

router
    .get('/', parroquiaController.get)
    .get('/:id', parroquiaController.getById)
    .post('/', parroquiaController.create)
    .put('/:id', parroquiaController.update)
    .delete('/:id', parroquiaController._delete);

module.exports = router;
