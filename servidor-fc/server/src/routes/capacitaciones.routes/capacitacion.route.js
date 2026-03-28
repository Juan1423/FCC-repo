const express = require('express');
const router = express.Router();
const capacitacionController = require('../../controllers/capacitaciones.controllers/capacitacion.controller');

router
    .get('/', capacitacionController.get)
    .get('/:id', capacitacionController.getById)
    .post('/', capacitacionController.create)
    .put('/:id', capacitacionController.update)
    .delete('/:id', capacitacionController._delete);

module.exports = router;