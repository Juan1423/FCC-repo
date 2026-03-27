'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversaciones', {
      id_conversacion: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true,
      },
      id_usuario: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      mensaje_usuario: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      respuesta_bot: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fecha_conversacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }, {
      schema: 'fcc_historiaclinica',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conversaciones', { schema: 'fcc_historiaclinica' });
  }
};