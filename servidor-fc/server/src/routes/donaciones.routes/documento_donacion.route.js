const express = require('express');
const router = express.Router();
const documentoDonacionController = require('../../controllers/donaciones.controllers/documento_donacion.controller');

router
    .get('/', documentoDonacionController.get)
    .get('/:id', documentoDonacionController.getById)
    .post('/', documentoDonacionController.create)
    .put('/:id', documentoDonacionController.update)
    .delete('/:id', documentoDonacionController._delete);

module.exports = router;
