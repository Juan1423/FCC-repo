'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversaciones_anonimas', {
      id_conversacion_anonima: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_usuario_anonimo: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios_anonimos',
          key: 'id_usuario_anonimo'
        }
      },
      mensaje_usuario: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      respuesta_bot: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      consentimiento: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      fecha_conversacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      tiempo_respuesta: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tokens_usados: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.addIndex('conversaciones_anonimas', ['id_usuario_anonimo']);
    await queryInterface.addIndex('conversaciones_anonimas', ['fecha_conversacion']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conversaciones_anonimas');
  }
};