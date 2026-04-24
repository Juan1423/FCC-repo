const tipoDocumentoRoutes = require('./tipo_documento.route');
const documentoRoutes = require('./documento.route');
const tipoIndicadorRoutes = require('./tipo_indicador.route');
const tipoInstitucionRoutes = require('./tipo_institucion.route');
const docTipoNormativaRoutes = require('./doc_tipo_normativa.route');
const docTipoProcesoRoutes = require('./doc_tipo_proceso.route');
const moduloRoutes = require('./modulo.route');
const procesoRoutes = require('./proceso.route');
const docNormativaRoutes = require('./doc_normativa.route');
const indicadorRoutes = require('./indicador.route');
const institucionRoutes = require('./institucion.route');
const registrarProcesosRoutes = require('./registrar_procesos.route');

function setupDocumentacionRoutes(router) {
    router.use('/tipo_documento', tipoDocumentoRoutes);
    router.use('/documento', documentoRoutes);
    router.use('/tipo_indicador', tipoIndicadorRoutes);
    router.use('/tipo_institucion', tipoInstitucionRoutes);
    router.use('/tipo_normativa', docTipoNormativaRoutes);
    router.use('/tipo_proceso', docTipoProcesoRoutes);
    router.use('/modulo', moduloRoutes);
    router.use('/proceso', procesoRoutes);
    router.use('/normativa', docNormativaRoutes);
    router.use('/indicador', indicadorRoutes);
    router.use('/institucion', institucionRoutes);
    router.use('/registrar_procesos', registrarProcesosRoutes);
}

module.exports = setupDocumentacionRoutes;