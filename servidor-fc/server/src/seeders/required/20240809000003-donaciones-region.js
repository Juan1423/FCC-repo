'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'region', schema: 'fcc_historiaclinica' },
      [
        { id_region: 1, nombre: 'Costa' },
        { id_region: 2, nombre: 'Sierra' },
        { id_region: 3, nombre: 'Oriente' },
        { id_region: 4, nombre: 'Insular' },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'region', schema: 'fcc_historiaclinica' },
      null,
      {}
    );
  }
};
