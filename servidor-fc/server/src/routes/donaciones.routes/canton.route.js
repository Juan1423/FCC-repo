const express = require('express');
const router = express.Router();
const cantonController = require('../../controllers/donaciones.controllers/canton.controller');

router
    .get('/', cantonController.get)
    .get('/:id', cantonController.getById)
    .post('/', cantonController.create)
    .put('/:id', cantonController.update)
    .delete('/:id', cantonController._delete);

module.exports = router;
