'use strict';

const CHAT_SCHEMA = 'fcc_historiaclinica';

const chatTables = [
  { tableName: 'chat_conocimiento', comment: "Canal del item: 'ambos' | 'publico' | 'interno'" },
  { tableName: 'chat_respuestas_canonicas', comment: "Canal de la canónica: 'ambos' | 'publico' | 'interno'" },
  { tableName: 'chat_prompts', comment: "Canal del prompt: 'ambos' | 'publico' | 'interno'" },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const { tableName, comment } of chatTables) {
      await queryInterface.addColumn(
        { tableName, schema: CHAT_SCHEMA },
        'canal',
        {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'ambos',
          comment,
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    for (const { tableName } of chatTables) {
      await queryInterface.removeColumn({ tableName, schema: CHAT_SCHEMA }, 'canal');
    }
  }
};