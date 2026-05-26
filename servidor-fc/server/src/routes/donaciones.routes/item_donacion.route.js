const express = require('express');
const router = express.Router();
const itemDonacionController = require('../../controllers/donaciones.controllers/item_donacion.controller');

router
    .get('/', itemDonacionController.get)
    .get('/:id', itemDonacionController.getById)
    .post('/', itemDonacionController.create)
    .put('/:id', itemDonacionController.update)
    .delete('/:id', itemDonacionController._delete);

module.exports = router;
