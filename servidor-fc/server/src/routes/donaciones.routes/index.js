const { requireRole } = require('../../middleware/verifyToken');

const DON_ROLES = ['admin', 'personal_administrativo'];

const mutacionesProtegidas = (roles) => (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  return requireRole(roles)(req, res, next);
};

const continenteRouter = require('./continente.route');
const regionRouter = require('./region.route');
const provinciaRouter = require('./provincia.route');
const cantonRouter = require('./canton.route');
const parroquiaRouter = require('./parroquia.route');
const paisRouter = require('./pais.route');
const ciudadRouter = require('./ciudad.route');
const tipoDonanteRouter = require('./tipo_donante.route');
const tipoOrganizacionRouter = require('./tipo_organizacion.route');
const tipoDonacionRouter = require('./tipo_donacion.route');
const itemDonacionRouter = require('./item_donacion.route');
const organizacionRouter = require('./organizacion.route');
const donanteNacionalRouter = require('./donante_nacional.route');
const donanteInternacionalRouter = require('./donante_internacional.route');
const donacionNacionalRouter = require('./donacion_nacional.route');
const donacionInternacionalRouter = require('./donacion_internacional.route');
const detalleDonacionRouter = require('./detalle_donacion.route');
const documentoDonacionRouter = require('./documento_donacion.route');
const verificacionDonacionRouter = require('./verificacion_donacion.route');


function setupDonacionesRoutes(router) {

  router.use('/continente', mutacionesProtegidas(DON_ROLES), continenteRouter)
  router.use('/region', mutacionesProtegidas(DON_ROLES), regionRouter)
  router.use('/provincia', mutacionesProtegidas(DON_ROLES), provinciaRouter)
  router.use('/canton', mutacionesProtegidas(DON_ROLES), cantonRouter)
  router.use('/parroquia', mutacionesProtegidas(DON_ROLES), parroquiaRouter)
  router.use('/pais', mutacionesProtegidas(DON_ROLES), paisRouter)
  router.use('/ciudad', mutacionesProtegidas(DON_ROLES), ciudadRouter)
  router.use('/tipo_donante', mutacionesProtegidas(DON_ROLES), tipoDonanteRouter)
  router.use('/tipo_organizacion', requireRole(DON_ROLES), tipoOrganizacionRouter)
  router.use('/tipo_donacion', mutacionesProtegidas(DON_ROLES), tipoDonacionRouter)
  router.use('/item_donacion', requireRole(DON_ROLES), itemDonacionRouter)
  router.use('/organizacion', requireRole(DON_ROLES), organizacionRouter)
  router.use('/donante_nacional', requireRole(DON_ROLES), donanteNacionalRouter)
  router.use('/donante_internacional', requireRole(DON_ROLES), donanteInternacionalRouter)
  router.use('/donacion_nacional', donacionNacionalRouter)
  router.use('/donacion_internacional', donacionInternacionalRouter)
  router.use('/detalle_donacion', requireRole(DON_ROLES), detalleDonacionRouter)
  router.use('/documento_donacion', requireRole(DON_ROLES), documentoDonacionRouter)
  router.use('/verificacion_donacion', requireRole(DON_ROLES), verificacionDonacionRouter)

}

module.exports = setupDonacionesRoutes;