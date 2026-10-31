const express = require('express');
const router = express.Router();
const donacionInternacionalController = require('../../controllers/donaciones.controllers/donacion_internacional.controller');
const { verifyToken, requireRole } = require('../../middleware/verifyToken');

const DON_ROLES = ['admin', 'personal_administrativo'];

router
    .get('/', verifyToken, requireRole(DON_ROLES), donacionInternacionalController.get)
    .get('/:id', verifyToken, requireRole(DON_ROLES), donacionInternacionalController.getById)
    .post('/', donacionInternacionalController.create)
    .put('/:id', verifyToken, requireRole(DON_ROLES), donacionInternacionalController.update)
    .delete('/:id', verifyToken, requireRole(DON_ROLES), donacionInternacionalController._delete);

module.exports = router;