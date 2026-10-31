const express = require('express');
const router = express.Router();
const donacionNacionalController = require('../../controllers/donaciones.controllers/donacion_nacional.controller');
const { verifyToken, requireRole } = require('../../middleware/verifyToken');

const DON_ROLES = ['admin', 'personal_administrativo'];

router
    .get('/', verifyToken, requireRole(DON_ROLES), donacionNacionalController.get)
    .get('/:id', verifyToken, requireRole(DON_ROLES), donacionNacionalController.getById)
    .post('/', donacionNacionalController.create)
    .put('/:id', verifyToken, requireRole(DON_ROLES), donacionNacionalController.update)
    .delete('/:id', verifyToken, requireRole(DON_ROLES), donacionNacionalController._delete);

module.exports = router;