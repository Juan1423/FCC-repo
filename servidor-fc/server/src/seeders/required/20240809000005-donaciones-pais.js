'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'pais', schema: 'fcc_historiaclinica' },
      [
        // América del Sur
        { id_pais: 1, nombre: 'Ecuador', id_continente: 2 },
        { id_pais: 2, nombre: 'Colombia', id_continente: 2 },
        { id_pais: 3, nombre: 'Perú', id_continente: 2 },
        { id_pais: 4, nombre: 'Argentina', id_continente: 2 },
        { id_pais: 5, nombre: 'Chile', id_continente: 2 },
        { id_pais: 6, nombre: 'Brasil', id_continente: 2 },
        { id_pais: 7, nombre: 'Venezuela', id_continente: 2 },
        { id_pais: 8, nombre: 'Bolivia', id_continente: 2 },
        { id_pais: 9, nombre: 'Uruguay', id_continente: 2 },
        { id_pais: 10, nombre: 'Paraguay', id_continente: 2 },
        // América del Norte
        { id_pais: 11, nombre: 'Estados Unidos', id_continente: 1 },
        { id_pais: 12, nombre: 'Canadá', id_continente: 1 },
        { id_pais: 13, nombre: 'México', id_continente: 1 },
        // América Central
        { id_pais: 14, nombre: 'Panamá', id_continente: 3 },
        { id_pais: 15, nombre: 'Costa Rica', id_continente: 3 },
        { id_pais: 16, nombre: 'Guatemala', id_continente: 3 },
        // Europa
        { id_pais: 17, nombre: 'España', id_continente: 4 },
        { id_pais: 18, nombre: 'Italia', id_continente: 4 },
        { id_pais: 19, nombre: 'Francia', id_continente: 4 },
        { id_pais: 20, nombre: 'Alemania', id_continente: 4 },
        { id_pais: 21, nombre: 'Reino Unido', id_continente: 4 },
        { id_pais: 22, nombre: 'Suiza', id_continente: 4 },
        // Asia
        { id_pais: 23, nombre: 'China', id_continente: 5 },
        { id_pais: 24, nombre: 'Japón', id_continente: 5 },
        { id_pais: 25, nombre: 'Corea del Sur', id_continente: 5 },
        { id_pais: 26, nombre: 'India', id_continente: 5 },
        // África
        { id_pais: 27, nombre: 'Sudáfrica', id_continente: 6 },
        { id_pais: 28, nombre: 'Egipto', id_continente: 6 },
        { id_pais: 29, nombre: 'Marruecos', id_continente: 6 },
        // Oceanía
        { id_pais: 30, nombre: 'Australia', id_continente: 7 },
        { id_pais: 31, nombre: 'Nueva Zelanda', id_continente: 7 },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'pais', schema: 'fcc_historiaclinica' },
      null,
      {}
    );
  }
};
