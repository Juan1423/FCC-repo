'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('conversaciones_anonimas', 'id_conversacion', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: {
          tableName: 'conversaciones',
          schema: 'fcc_historiaclinica'
        },
        key: 'id_conversacion'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }, { schema: 'fcc_historiaclinica' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversaciones_anonimas', 'id_conversacion', { schema: 'fcc_historiaclinica' });
  }
};
