const express = require('express');
const router = express.Router();
const pacienteController = require('../../controllers/historiaclinica.controllers/paciente.controller');


router
    .get('/', pacienteController.get)
    .get('/:id', pacienteController.getById)
    .post('/',pacienteController.fileUpload, pacienteController.create)
    .put('/:id',  pacienteController.fileUpload, pacienteController.update)
    .delete('/:id', pacienteController._delete)
    .put('/estado/:id', pacienteController.logicalDelete);

module.exports = router;
