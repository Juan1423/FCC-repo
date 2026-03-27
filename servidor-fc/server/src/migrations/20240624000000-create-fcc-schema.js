'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Asegura que el schema usado por la aplicación exista antes de ejecutar el resto de migraciones.
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS "fcc_historiaclinica"');
  },

  down: async (queryInterface, Sequelize) => {
    // No eliminamos el schema al revertir para evitar eliminar datos de otras tablas.
  }
};
