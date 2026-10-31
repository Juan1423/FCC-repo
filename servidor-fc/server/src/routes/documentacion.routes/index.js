const { requireRole } = require('../../middleware/verifyToken');

const DOC_ROLES = ['admin', 'personal_administrativo'];

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
    router.use('/tipo_documento', requireRole(DOC_ROLES), tipoDocumentoRoutes);
    router.use('/documento', requireRole(DOC_ROLES), documentoRoutes);
    router.use('/tipo_indicador', requireRole(DOC_ROLES), tipoIndicadorRoutes);
    router.use('/tipo_institucion', requireRole(DOC_ROLES), tipoInstitucionRoutes);
    router.use('/tipo_normativa', requireRole(DOC_ROLES), docTipoNormativaRoutes);
    router.use('/tipo_proceso', requireRole(DOC_ROLES), docTipoProcesoRoutes);
    router.use('/modulo', requireRole(DOC_ROLES), moduloRoutes);
    router.use('/proceso', requireRole(DOC_ROLES), procesoRoutes);
    router.use('/normativa', requireRole(DOC_ROLES), docNormativaRoutes);
    router.use('/indicador', requireRole(DOC_ROLES), indicadorRoutes);
    router.use('/institucion', requireRole(DOC_ROLES), institucionRoutes);
    router.use('/registrar_procesos', requireRole(DOC_ROLES), registrarProcesosRoutes);
}

module.exports = setupDocumentacionRoutes;