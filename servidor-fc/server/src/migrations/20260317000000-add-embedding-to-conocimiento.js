'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('conocimiento', 'embedding', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Embedding vector generado por OpenAI para búsqueda semántica RAG'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('conocimiento', 'embedding');
  }
};