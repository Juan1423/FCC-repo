const express = require('express');
const router = express.Router();
const provinciaController = require('../../controllers/donaciones.controllers/provincia.controller');

router
    .get('/', provinciaController.get)
    .get('/:id', provinciaController.getById)
    .post('/', provinciaController.create)
    .put('/:id', provinciaController.update)
    .delete('/:id', provinciaController._delete);

module.exports = router;
