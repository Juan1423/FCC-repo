'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'continente', schema: 'fcc_historiaclinica' },
      [
        { id_continente: 1, nombre: 'América del Norte' },
        { id_continente: 2, nombre: 'América del Sur' },
        { id_continente: 3, nombre: 'América Central' },
        { id_continente: 4, nombre: 'Europa' },
        { id_continente: 5, nombre: 'Asia' },
        { id_continente: 6, nombre: 'África' },
        { id_continente: 7, nombre: 'Oceanía' },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'continente', schema: 'fcc_historiaclinica' },
      null,
      {}
    );
  }
};
