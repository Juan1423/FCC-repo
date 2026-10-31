const express = require('express');
const router = express.Router();
const personalsaludController = require('../../controllers/historiaclinica.controllers/personalsalud.controller');
const { requireRole } = require('../../middleware/verifyToken');

router
    .get('/', requireRole(['admin']), personalsaludController.get)
    .get('/:id', requireRole(['admin', 'personal_salud']), personalsaludController.getById)
    .get('/:id/estadisticas', requireRole(['admin', 'personal_salud']), personalsaludController.getEstadisticas)
    .post('/', requireRole(['admin']), personalsaludController.fileUpload, personalsaludController.create)
    .put('/:id', requireRole(['admin']), personalsaludController.fileUpload, personalsaludController.update)
    .delete('/:id', requireRole(['admin']), personalsaludController._delete)
    .put('/estado/:id', requireRole(['admin']), personalsaludController.logicalDelete);

module.exports = router;