'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migración obsoleta: la tabla categorias_preguntas fue eliminada
    // No hacer nada
  },

  down: async (queryInterface, Sequelize) => {
    // No hacer nada
  }
};