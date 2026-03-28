'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('preguntas_anonimas', {
      id_pregunta_anonima: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pregunta: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      fecha_pregunta: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('preguntas_anonimas', ['cedula']);
    await queryInterface.addIndex('preguntas_anonimas', ['fecha_pregunta']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('preguntas_anonimas');
  }
};