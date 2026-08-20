const setupHistoriaClinicaModels = require('./historiaclinica.models');
const setupComunidadModels = require('./comunidad.models');
const setupDonacionesModels = require('./donaciones.models');
const setupCapacitacionesModels = require('./capacitaciones.models');
const setupChatModels = require('./chat.models');
const setupDocumentacionModels = require('./documentacion.models');
const setupHooks = require('./hooks');

function setupModels(sequelize) {
  setupHistoriaClinicaModels(sequelize);
  setupComunidadModels(sequelize);
  setupDonacionesModels(sequelize);
  setupCapacitacionesModels(sequelize);
  setupChatModels(sequelize);
  setupDocumentacionModels(sequelize);

  // Configurar hooks después de inicializar los modelos
  setupHooks();
}

module.exports = setupModels;
