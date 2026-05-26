const express = require('express');
const router = express.Router();
const regionController = require('../../controllers/donaciones.controllers/region.controller');

router
    .get('/', regionController.get)
    .get('/:id', regionController.getById)
    .post('/', regionController.create)
    .put('/:id', regionController.update)
    .delete('/:id', regionController._delete);

module.exports = router;
