'use strict';

const CHAT_SCHEMA = 'fcc_historiaclinica';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      { tableName: 'chat_rag_monitor', schema: CHAT_SCHEMA },
      {
        id_diagnostico: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        id_conversacion: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: { tableName: 'chat_conversaciones', schema: CHAT_SCHEMA }, key: 'id_conversacion' },
          onDelete: 'SET NULL',
        },
        tipo: {
          type: Sequelize.ENUM('publico', 'interno'),
          allowNull: false,
          defaultValue: 'publico',
        },
        pregunta: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        respuesta: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        similitud_maxima: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        },
        umbral_usado: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0.7,
        },
        n_resultados: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        resultados_json: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        contexto_rag_incluido: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        flag_modelo_ignoro: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        flag_busqueda_pobre: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        respuesta_insuficiente: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        decision: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        modelo: {
          type: Sequelize.STRING(80),
          allowNull: true,
        },
        fecha_diagnostico: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
      }
    );

    await queryInterface.addIndex(
      { tableName: 'chat_rag_monitor', schema: CHAT_SCHEMA },
      ['flag_modelo_ignoro'],
      { name: 'idx_rag_monitor_flag_modelo' }
    );
    await queryInterface.addIndex(
      { tableName: 'chat_rag_monitor', schema: CHAT_SCHEMA },
      ['fecha_diagnostico'],
      { name: 'idx_rag_monitor_fecha' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: 'chat_rag_monitor', schema: CHAT_SCHEMA });
  }
};