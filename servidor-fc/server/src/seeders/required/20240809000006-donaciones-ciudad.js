'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'ciudad', schema: 'fcc_historiaclinica' },
      [
        // Ecuador
        { id_ciudad: 1, nombre: 'Quito', id_pais: 1 },
        { id_ciudad: 2, nombre: 'Guayaquil', id_pais: 1 },
        { id_ciudad: 3, nombre: 'Cuenca', id_pais: 1 },
        { id_ciudad: 4, nombre: 'Santo Domingo', id_pais: 1 },
        { id_ciudad: 5, nombre: 'Manta', id_pais: 1 },
        { id_ciudad: 6, nombre: 'Ambato', id_pais: 1 },
        // Colombia
        { id_ciudad: 7, nombre: 'Bogotá', id_pais: 2 },
        { id_ciudad: 8, nombre: 'Medellín', id_pais: 2 },
        { id_ciudad: 9, nombre: 'Cali', id_pais: 2 },
        // Perú
        { id_ciudad: 10, nombre: 'Lima', id_pais: 3 },
        { id_ciudad: 11, nombre: 'Cusco', id_pais: 3 },
        // Argentina
        { id_ciudad: 12, nombre: 'Buenos Aires', id_pais: 4 },
        // Chile
        { id_ciudad: 13, nombre: 'Santiago', id_pais: 5 },
        // Brasil
        { id_ciudad: 14, nombre: 'São Paulo', id_pais: 6 },
        { id_ciudad: 15, nombre: 'Río de Janeiro', id_pais: 6 },
        // Venezuela
        { id_ciudad: 16, nombre: 'Caracas', id_pais: 7 },
        // Estados Unidos
        { id_ciudad: 17, nombre: 'Nueva York', id_pais: 11 },
        { id_ciudad: 18, nombre: 'Miami', id_pais: 11 },
        { id_ciudad: 19, nombre: 'Los Ángeles', id_pais: 11 },
        // Canadá
        { id_ciudad: 20, nombre: 'Toronto', id_pais: 12 },
        // México
        { id_ciudad: 21, nombre: 'Ciudad de México', id_pais: 13 },
        // España
        { id_ciudad: 22, nombre: 'Madrid', id_pais: 17 },
        { id_ciudad: 23, nombre: 'Barcelona', id_pais: 17 },
        // Italia
        { id_ciudad: 24, nombre: 'Roma', id_pais: 18 },
        // Francia
        { id_ciudad: 25, nombre: 'París', id_pais: 19 },
        // Alemania
        { id_ciudad: 26, nombre: 'Berlín', id_pais: 20 },
        // Reino Unido
        { id_ciudad: 27, nombre: 'Londres', id_pais: 21 },
        // China
        { id_ciudad: 28, nombre: 'Pekín', id_pais: 23 },
        // Japón
        { id_ciudad: 29, nombre: 'Tokio', id_pais: 24 },
        // Australia
        { id_ciudad: 30, nombre: 'Sídney', id_pais: 30 },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'ciudad', schema: 'fcc_historiaclinica' },
      null,
      {}
    );
  }
};
