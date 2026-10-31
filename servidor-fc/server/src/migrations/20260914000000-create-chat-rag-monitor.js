'use strict';

const CHAT_SCHEMA = 'fcc_historiaclinica';

const tableExists = async (queryInterface, tableName) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = :schema AND table_name = :table`,
    { replacements: { schema: CHAT_SCHEMA, table: tableName } }
  );
  return rows.length > 0;
};

const indexExists = async (queryInterface, indexName) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_indexes WHERE schemaname = :schema AND indexname = :index`,
    { replacements: { schema: CHAT_SCHEMA, index: indexName } }
  );
  return rows.length > 0;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const yaExiste = await tableExists(queryInterface, 'chat_rag_monitor');
    if (yaExiste) {
      await(queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_rag_monitor_flag_modelo ON fcc_historiaclinica.chat_rag_monitor (flag_modelo_ignoro)`
      ));
      await(queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_rag_monitor_fecha ON fcc_historiaclinica.chat_rag_monitor (fecha_diagnostico)`
      ));
      return;
    }

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

    if (!(await indexExists(queryInterface, 'idx_rag_monitor_flag_modelo'))) {
      await queryInterface.addIndex(
        { tableName: 'chat_rag_monitor', schema: CHAT_SCHEMA },
        ['flag_modelo_ignoro'],
        { name: 'idx_rag_monitor_flag_modelo' }
      );
    }
    if (!(await indexExists(queryInterface, 'idx_rag_monitor_fecha'))) {
      await queryInterface.addIndex(
        { tableName: 'chat_rag_monitor', schema: CHAT_SCHEMA },
        ['fecha_diagnostico'],
        { name: 'idx_rag_monitor_fecha' }
      );
    }
  },

  down: async (queryInterface) => {
    const existe = await tableExists(queryInterface, 'chat_rag_monitor');
    if (!existe) return;
    await queryInterface.dropTable({ tableName: 'chat_rag_monitor', schema: CHAT_SCHEMA });
  },
};
