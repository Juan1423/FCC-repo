
const capacitadorRouter = require('./capacitador.route');
const capacitacionRouter = require('./capacitacion.route');


function setupCapacitacionRoutes(router) {
  
  router.use('/capacitador', capacitadorRouter)
  router.use('/capacitacion', capacitacionRouter)


  }

module.exports = setupCapacitacionRoutes;