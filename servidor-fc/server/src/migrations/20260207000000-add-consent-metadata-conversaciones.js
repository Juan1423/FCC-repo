'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add consentimiento and metadata columns if they don't exist
    const table = { schema: 'fcc_historiaclinica', tableName: 'conversaciones' };
    try {
      await queryInterface.addColumn(table, 'consentimiento', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    } catch (e) {
      // ignore if already exists
      console.warn('consentimiento column add skipped:', e.message);
    }

    try {
      await queryInterface.addColumn(table, 'metadata', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    } catch (e) {
      console.warn('metadata column add skipped:', e.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = { schema: 'fcc_historiaclinica', tableName: 'conversaciones' };
    try {
      await queryInterface.removeColumn(table, 'consentimiento');
    } catch (e) {
      console.warn('consentimiento remove skipped:', e.message);
    }
    try {
      await queryInterface.removeColumn(table, 'metadata');
    } catch (e) {
      console.warn('metadata remove skipped:', e.message);
    }
  }
};
