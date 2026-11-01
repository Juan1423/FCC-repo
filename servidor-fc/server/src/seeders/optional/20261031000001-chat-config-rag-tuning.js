'use strict';

/**
 * Claves de configuración para el endurecimiento del pipeline RAG.
 * Se insertan de forma idempotente: si ya existen no se tocan.
 */
const configKeys = [
  // NOTA: rag_umbral_alto, guardrail_sensible_threshold y rag_umbral_estricto
  // NO se siembran aquí a propósito: su valor correcto depende del modelo de
  // embeddings (text-embedding-3-small vs ada-002 comparten 1536 dims pero su
  // coseno NO es comparable). El código usa la banda del modelo cuando la clave
  // no existe. Si se siembra un valor fijo se produce deriva silenciosa.
  {
    clave: 'rag_margen_top2',
    valor: '0',
    tipo: 'float',
    descripcion: 'Margen mínimo top1-top2 para aceptar consultas ambiguas (0 = desactivado, recomendado 0.05-0.10)',
  },
  {
    clave: 'rag_lexical_rescue_enabled',
    valor: 'false',
    tipo: 'boolean',
    descripcion: 'Rescata coincidencias léxicas exactas (artículos, códigos, IDs) por debajo del umbral coseno',
  },
  {
    clave: 'rag_lexical_rescue_floor',
    valor: '0.30',
    tipo: 'float',
    descripcion: 'Coseno mínimo para aplicar el rescate léxico cuando está habilitado',
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'chat_configuracion';

    for (const item of configKeys) {
      const existing = await queryInterface.sequelize.query(
        `SELECT clave FROM fcc_historiaclinica.${tableName} WHERE clave = :clave`,
        {
          replacements: { clave: item.clave },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert(
          { tableName, schema: 'fcc_historiaclinica' },
          [item],
          {}
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `DELETE FROM fcc_historiaclinica.chat_configuracion WHERE clave IN (:claves)`,
      {
        replacements: { claves: configKeys.map((item) => item.clave) },
        type: Sequelize.QueryTypes.DELETE,
      }
    );
  },
};
