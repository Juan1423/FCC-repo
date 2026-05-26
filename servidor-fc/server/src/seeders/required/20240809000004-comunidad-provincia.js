'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert({tableName: 'provincia', schema: 'fcc_historiaclinica' }, [
      { nombre: 'AZUAY', id_region: 2 },
      { nombre: 'BOLIVAR', id_region: 2 },
      { nombre: 'CAÑAR', id_region: 2 },
      { nombre: 'CARCHI', id_region: 2 },
      { nombre: 'COTOPAXI', id_region: 2 },
      { nombre: 'CHIMBORAZO', id_region: 2 },
      { nombre: 'EL ORO', id_region: 1 },
      { nombre: 'ESMERALDAS', id_region: 1 },
      { nombre: 'GUAYAS', id_region: 1 },
      { nombre: 'IMBABURA', id_region: 2 },
      { nombre: 'LOJA', id_region: 2 },
      { nombre: 'LOS RIOS', id_region: 1 },
      { nombre: 'MANABI', id_region: 1 },
      { nombre: 'MORONA SANTIAGO', id_region: 3 },
      { nombre: 'NAPO', id_region: 3 },
      { nombre: 'PASTAZA', id_region: 3 },
      { nombre: 'PICHINCHA', id_region: 2 },
      { nombre: 'TUNGURAHUA', id_region: 2 },
      { nombre: 'ZAMORA CHINCHIPE', id_region: 2 },
      { nombre: 'GALAPAGOS', id_region: 4 },
      { nombre: 'SUCUMBIOS', id_region: 3 },
      { nombre: 'ORELLANA', id_region: 3 },
      { nombre: 'SANTO DOMINGO DE LOS TSACHILAS', id_region: 1 },
      { nombre: 'SANTA ELENA', id_region: 1 },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({tableName: 'provincia', schema: 'fcc_historiaclinica' }, null, {});
  }
};