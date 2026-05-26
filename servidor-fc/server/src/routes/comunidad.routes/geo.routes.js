const express = require('express');
const router = express.Router();
const geoController = require('../../controllers/comunidad.controllers/geo.controller');

router
    .get('/', geoController.get)
    .get('/:id', geoController.getById)
    .post('/', geoController.create)
    .put('/:id', geoController.update)
    .delete('/:id', geoController._delete);

module.exports = router;
