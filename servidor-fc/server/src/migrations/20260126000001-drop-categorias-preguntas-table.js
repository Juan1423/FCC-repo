'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('categorias_preguntas', {
      cascade: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('categorias_preguntas', {
      id_categoria: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true,
      },
      nombre_categoria: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descripcion: {
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
