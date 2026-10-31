'use strict';

const CHAT_SCHEMA = 'fcc_historiaclinica';

const chatTables = [
  { tableName: 'chat_conocimiento', comment: "Canal del item: 'ambos' | 'publico' | 'interno'" },
  { tableName: 'chat_respuestas_canonicas', comment: "Canal de la canónica: 'ambos' | 'publico' | 'interno'" },
  { tableName: 'chat_prompts', comment: "Canal del prompt: 'ambos' | 'publico' | 'interno'" },
];

const columnExists = async (queryInterface, tableName, columnName) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = :schema AND table_name = :table AND column_name = :column`,
    { replacements: { schema: CHAT_SCHEMA, table: tableName, column: columnName } }
  );
  return rows.length > 0;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const { tableName, comment } of chatTables) {
      const existe = await columnExists(queryInterface, tableName, 'canal');
      if (existe) {
        continue;
      }
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

  down: async (queryInterface) => {
    for (const { tableName } of chatTables) {
      const existe = await columnExists(queryInterface, tableName, 'canal');
      if (!existe) continue;
      await queryInterface.removeColumn({ tableName, schema: CHAT_SCHEMA }, 'canal');
    }
  },
};
