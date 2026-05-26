const express = require('express');
const router = express.Router();
const organizacionController = require('../../controllers/donaciones.controllers/organizacion.controller');

router
    .get('/', organizacionController.get)
    .get('/:id', organizacionController.getById)
    .post('/', organizacionController.create)
    .put('/:id', organizacionController.update)
    .delete('/:id', organizacionController._delete);

module.exports = router;
