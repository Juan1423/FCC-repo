
//const tipo_gestionRouter = require('./tipo_gestion.route');
const botInternoRouter = require('./bot_interno.routes');
const historialIARouter = require('./historial_ia.routes');


function setupChatServidorRoutes(router) {
  
  //router.use('/tipo_gestion', tipo_gestionRouter);
  router.use('/asistente', botInternoRouter);
  router.use('/asistente', historialIARouter);


  }

module.exports = setupChatServidorRoutes;