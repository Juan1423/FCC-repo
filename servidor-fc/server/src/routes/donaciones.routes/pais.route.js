const express = require('express');
const router = express.Router();
const paisController = require('../../controllers/donaciones.controllers/pais.controller');

router
    .get('/', paisController.get)
    .get('/:id', paisController.getById)
    .post('/', paisController.create)
    .put('/:id', paisController.update)
    .delete('/:id', paisController._delete);

module.exports = router;
