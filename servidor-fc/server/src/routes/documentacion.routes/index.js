const express = require('express');
const router = express.Router();

const tipoDocumentoRoutes = require('./tipo_documento.route');
//const categoriaDocumentoRoutes = require('./categoriaDocumento.routes');
const documentoRoutes = require('./documento.route');
//const documentoArchivoRoutes = require('./documentoArchivo.routes');
//const documentoHistorialRoutes = require('./documentoHistorial.routes');


function setupComunidadRoutes(router) {

router.use('/tipo-documento', tipoDocumentoRoutes);
//router.use('/categoria-documento', categoriaDocumentoRoutes);
router.use('/documento', documentoRoutes);
//router.use('/documento-archivo', documentoArchivoRoutes);
//router.use('/documento-historial', documentoHistorialRoutes);


}


module.exports = setupComunidadRoutes;
