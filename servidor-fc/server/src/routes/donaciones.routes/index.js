
const continenteRouter = require('./continente.route');
const regionRouter = require('./region.route');
const provinciaRouter = require('./provincia.route');
const cantonRouter = require('./canton.route');
const parroquiaRouter = require('./parroquia.route');
const paisRouter = require('./pais.route');
const ciudadRouter = require('./ciudad.route');
const tipoDonanteRouter = require('./tipo_donante.route');
const tipoEmpleadoRouter = require('./tipo_empleado.route');
const tipoOrganizacionRouter = require('./tipo_organizacion.route');
const tipoDonacionRouter = require('./tipo_donacion.route');
const itemDonacionRouter = require('./item_donacion.route');
const organizacionRouter = require('./organizacion.route');
const empleadoRouter = require('./empleado.route');
const donanteNacionalRouter = require('./donante_nacional.route');
const donanteInternacionalRouter = require('./donante_internacional.route');
const donacionNacionalRouter = require('./donacion_nacional.route');
const donacionInternacionalRouter = require('./donacion_internacional.route');
const detalleDonacionRouter = require('./detalle_donacion.route');
const documentoDonacionRouter = require('./documento_donacion.route');
const verificacionDonacionRouter = require('./verificacion_donacion.route');


function setupDonacionesRoutes(router) {
  
  router.use('/continente', continenteRouter)
  router.use('/region', regionRouter)
  router.use('/provincia', provinciaRouter)
  router.use('/canton', cantonRouter)
  router.use('/parroquia', parroquiaRouter)
  router.use('/pais', paisRouter)
  router.use('/ciudad', ciudadRouter)
  router.use('/tipo_donante', tipoDonanteRouter)
  router.use('/tipo_empleado', tipoEmpleadoRouter)
  router.use('/tipo_organizacion', tipoOrganizacionRouter)
  router.use('/tipo_donacion', tipoDonacionRouter)
  router.use('/item_donacion', itemDonacionRouter)
  router.use('/organizacion', organizacionRouter)
  router.use('/empleado', empleadoRouter)
  router.use('/donante_nacional', donanteNacionalRouter)
  router.use('/donante_internacional', donanteInternacionalRouter)
  router.use('/donacion_nacional', donacionNacionalRouter)
  router.use('/donacion_internacional', donacionInternacionalRouter)
  router.use('/detalle_donacion', detalleDonacionRouter)
  router.use('/documento_donacion', documentoDonacionRouter)
  router.use('/verificacion_donacion', verificacionDonacionRouter)

}

module.exports = setupDonacionesRoutes;
