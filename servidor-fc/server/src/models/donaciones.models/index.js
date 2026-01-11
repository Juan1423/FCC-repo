const { Continente, ContinenteSchema } = require('./continente.model');



function setupDonacionesModels(sequelize) {


   //models
   Continente.init(ContinenteSchema, Continente.config(sequelize));

   //association
   //Continente.associate({ Canton });// formato para inicializar las asociasiones

}

module.exports = setupDonacionesModels;
