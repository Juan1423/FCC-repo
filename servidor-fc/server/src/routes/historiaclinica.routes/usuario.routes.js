const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/historiaclinica.controllers/usuario.controller');


router
    .get('/', usuarioController.get)
    .get('/:id', usuarioController.getById)
    .post('/', usuarioController.create)
    .put('/:id', usuarioController.update)
    .delete('/:id', usuarioController._delete)
    .post('/login', usuarioController.login)
    .post('/logout', usuarioController.logout);

module.exports = router;