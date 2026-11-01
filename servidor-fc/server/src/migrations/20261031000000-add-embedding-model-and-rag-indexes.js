'use strict';

const SCHEMA = 'fcc_historiaclinica';

const TABLAS_CON_EMBEDDING = [
  'chat_conocimiento',
  'chat_protocolos_sensibles',
  'chat_respuestas_canonicas',
  'chat_temas_validos',
];

async function columnaExiste(queryInterface, tableName, columnName) {
  const descripcion = await queryInterface.describeTable({ tableName, schema: SCHEMA });
  return Object.prototype.hasOwnProperty.call(descripcion, columnName);
}

async function indiceExiste(queryInterface, tableName, indexName) {
  const indices = await queryInterface.showIndex({ tableName, schema: SCHEMA });
  return indices.some((indice) => indice.name === indexName);
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modelo con el que se generó cada embedding. Necesario porque
    // text-embedding-3-small y text-embedding-ada-002 comparten 1536
    // dimensiones: la dimensión no permite detectar la deriva de modelo.
    for (const tableName of TABLAS_CON_EMBEDDING) {
      const existe = await columnaExiste(queryInterface, tableName, 'embedding_model');
      if (!existe) {
        await queryInterface.addColumn(
          { tableName, schema: SCHEMA },
          'embedding_model',
          {
            type: Sequelize.STRING(80),
            allowNull: true,
            comment: 'Modelo de embeddings usado para generar el vector (deriva de modelos)',
          }
        );
      }
    }

    // Prefiltros usados por loadKnowledgeIntoCache (estado_vigencia, bloqueado,
    // canal) y por la deduplicación de documentos (id_documento).
    const indices = [
      {
        tableName: 'chat_conocimiento',
        indexName: 'idx_chat_conocimiento_rag_prefiltro',
        fields: ['estado_vigencia', 'bloqueado', 'canal'],
      },
      {
        tableName: 'chat_conocimiento',
        indexName: 'idx_chat_conocimiento_documento',
        fields: ['id_documento'],
      },
      {
        tableName: 'chat_respuestas_canonicas',
        indexName: 'idx_chat_canonicas_activo_canal',
        fields: ['activo', 'canal'],
      },
    ];

    for (const { tableName, indexName, fields } of indices) {
      const existe = await indiceExiste(queryInterface, tableName, indexName);
      if (!existe) {
        await queryInterface.addIndex({ tableName, schema: SCHEMA }, fields, { name: indexName });
      }
    }
  },

  down: async (queryInterface) => {
    const indices = [
      { tableName: 'chat_conocimiento', indexName: 'idx_chat_conocimiento_rag_prefiltro' },
      { tableName: 'chat_conocimiento', indexName: 'idx_chat_conocimiento_documento' },
      { tableName: 'chat_respuestas_canonicas', indexName: 'idx_chat_canonicas_activo_canal' },
    ];

    for (const { tableName, indexName } of indices) {
      try {
        await queryInterface.removeIndex({ tableName, schema: SCHEMA }, indexName);
      } catch (error) {
        // El índice puede no existir en rollbacks parciales.
      }
    }

    for (const tableName of TABLAS_CON_EMBEDDING) {
      try {
        await queryInterface.removeColumn({ tableName, schema: SCHEMA }, 'embedding_model');
      } catch (error) {
        // La columna puede no existir en rollbacks parciales.
      }
    }
  },
};
