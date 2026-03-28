'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('peticion', {
      id_peticion: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true,
      },
      id_usuario: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_usuario_anonimo: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      tipo_peticion: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      respuesta: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tiempo_respuesta: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      exito: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
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
    await queryInterface.addIndex('peticion', ['id_usuario']);
    await queryInterface.addIndex('peticion', ['id_usuario_anonimo']);
    await queryInterface.addIndex('peticion', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('peticion');
  }
};