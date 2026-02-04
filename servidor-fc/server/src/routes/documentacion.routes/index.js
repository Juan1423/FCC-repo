const express = require('express');
const router = express.Router();

const tipoDocumentoRoutes = require('./tipoDocumento.routes');
const categoriaDocumentoRoutes = require('./categoriaDocumento.routes');
const documentoRoutes = require('./documento.routes');
const documentoArchivoRoutes = require('./documentoArchivo.routes');
const documentoHistorialRoutes = require('./documentoHistorial.routes');

router.use('/tipo-documento', tipoDocumentoRoutes);
router.use('/categoria-documento', categoriaDocumentoRoutes);
router.use('/documento', documentoRoutes);
router.use('/documento-archivo', documentoArchivoRoutes);
router.use('/documento-historial', documentoHistorialRoutes);

module.exports = router;
