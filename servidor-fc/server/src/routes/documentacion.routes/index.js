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
const historiasClinicasRoutes = require('./historias_clinicas.route');
const registrarProcesosRoutes = require('./registrar_procesos.route');

function setupDocumentacionRoutes(router) {
    router.use('/tipo-documento', tipoDocumentoRoutes);
    router.use('/documento', documentoRoutes);
    router.use('/tipo-indicador', tipoIndicadorRoutes);
    router.use('/tipo-institucion', tipoInstitucionRoutes);
    router.use('/doc-tipo-normativa', docTipoNormativaRoutes);
    router.use('/doc-tipo-proceso', docTipoProcesoRoutes);
    router.use('/modulo', moduloRoutes);
    router.use('/proceso', procesoRoutes);
    router.use('/doc-normativa', docNormativaRoutes);
    router.use('/indicador', indicadorRoutes);
    router.use('/institucion', institucionRoutes);
    router.use('/historias-clinicas', historiasClinicasRoutes);
    router.use('/registrar-procesos', registrarProcesosRoutes);
}

module.exports = setupDocumentacionRoutes;
