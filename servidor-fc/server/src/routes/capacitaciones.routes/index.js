const { requireRole } = require('../../middleware/verifyToken');

const capacitadorRouter = require('./capacitador.route');
const capacitacionRouter = require('./capacitacion.route');


function setupCapacitacionRoutes(router) {
  
  router.use('/capacitador', requireRole(['admin']), capacitadorRouter)
  router.use('/capacitacion', requireRole(['admin']), capacitacionRouter)


  }

module.exports = setupCapacitacionRoutes;