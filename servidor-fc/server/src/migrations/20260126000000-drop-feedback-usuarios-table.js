'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feedback_usuarios', {
      cascade: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('feedback_usuarios', {
      id_feedback: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true,
      },
      id_conversacion: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      calificacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true,
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
  }
};
