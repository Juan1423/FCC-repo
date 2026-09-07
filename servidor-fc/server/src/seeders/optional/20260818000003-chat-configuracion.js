'use strict';

const configKeys = [
  { clave: 'rate_limit_autenticado_diario', valor: '50', tipo: 'number', descripcion: 'Límite diario de preguntas para usuarios autenticados' },
  { clave: 'rate_limit_visitante_diario', valor: '5', tipo: 'number', descripcion: 'Límite diario de preguntas para visitantes anónimos' },
  { clave: 'rate_limit_ventana_horas', valor: '24', tipo: 'number', descripcion: 'Ventana de timepo para el rate limiting en horas' },
  { clave: 'off_topic_threshold', valor: '0.65', tipo: 'float', descripcion: 'Umbral de similitud coseno para considerar on-topic' },
  { clave: 'canonical_response_threshold', valor: '0.85', tipo: 'float', descripcion: 'Umbral de similitud para respuesta canónica' },
  { clave: 'rag_similarity_threshold', valor: '0.7', tipo: 'float', descripcion: 'Umbral de similitud para RAG' },
  { clave: 'max_contexto_rag_items', valor: '3', tipo: 'number', descripcion: 'Número máximo de items de contexto RAG' },
  { clave: 'enable_learning_queue', valor: 'true', tipo: 'boolean', descripcion: 'Habilitar cola de revisión de aprendizaje' },
  { clave: 'rate_persist_interval_min', valor: '5', tipo: 'number', descripcion: 'Intervalo de persistencia de contadores de rate limit' },
  { clave: 'sensitive_check_first', valor: 'true', tipo: 'boolean', descripcion: 'Verificar temas sensibles antes que off-topic' },
  { clave: 'feedback_threshold', valor: '2', tipo: 'number', descripcion: 'Calificación mínima para considerar feedback negativo (1-5)' },
  { clave: 'min_respuesta_length', valor: '50', tipo: 'number', descripcion: 'Longitud mínima de respuesta para trigger de revisión' },
  { clave: 'max_respuesta_length', valor: '2000', tipo: 'number', descripcion: 'Longitud máxima de respuesta para trigger de revisión' },
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
    await queryInterface.bulkDelete(
      { tableName: 'chat_configuracion', schema: 'fcc_historiaclinica' },
      { clave: configKeys.map(c => c.clave) }
    );
  },
};
