const { Capacitador, CapacitadorSchema } = require('./capacitador.model');
const { Capacitacion, CapacitacionSchema } = require('./capacitacion.model');



function setupCapacitacionesModels(sequelize) {


   //models
   Capacitador.init(CapacitadorSchema, Capacitador.config(sequelize));
   Capacitacion.init(CapacitacionSchema, Capacitacion.config(sequelize));

   //association
   //Capacitador.associate({ Canton });// formato para inicializar las asociasiones
   Capacitacion.associate(sequelize.models);
}

module.exports = setupCapacitacionesModels;
