'use strict';

const configKeys = [
  { clave: 'rate_limit_autenticado_diario', valor: '50', tipo: 'number', descripcion: 'Límite diario de preguntas para usuarios autenticados' },
  { clave: 'rate_limit_visitante_diario', valor: '5', tipo: 'number', descripcion: 'Límite diario de preguntas para visitantes anónimos' },
  { clave: 'rate_limit_ventana_horas', valor: '24', tipo: 'number', descripcion: 'Ventana de timepo para el rate limiting en horas' },
  { clave: 'off_topic_threshold', valor: '0.30', tipo: 'float', descripcion: 'Umbral de similitud coseno para considerar on-topic' },
  { clave: 'canonical_response_threshold', valor: '0.85', tipo: 'float', descripcion: 'Umbral de similitud para respuesta canónica' },
  { clave: 'rag_similarity_threshold', valor: '0.55', tipo: 'float', descripcion: 'Umbral de similitud para RAG' },
  { clave: 'max_contexto_rag_items', valor: '3', tipo: 'number', descripcion: 'Número máximo de items de contexto RAG' },
  { clave: 'rag_lexico_weight', valor: '0.2', tipo: 'float', descripcion: 'Peso del overlap léxico (keywords) al ordenar resultados RAG (0-0.6). 0 = solo coseno' },
  { clave: 'enable_learning_queue', valor: 'true', tipo: 'boolean', descripcion: 'Habilitar cola de revisión de aprendizaje' },
  { clave: 'sensitive_check_first', valor: 'true', tipo: 'boolean', descripcion: 'Verificar temas sensibles antes que off-topic' },
  { clave: 'feedback_threshold', valor: '2', tipo: 'number', descripcion: 'Calificación mínima para considerar feedback negativo (1-5)' },
  { clave: 'min_respuesta_length', valor: '10', tipo: 'number', descripcion: 'Longitud mínima de respuesta (en palabras) para trigger de revisión' },
  { clave: 'max_respuesta_length', valor: '350', tipo: 'number', descripcion: 'Longitud máxima de respuesta (en palabras) para trigger de revisión' },
  { clave: 'memory_enabled', valor: 'true', tipo: 'boolean', descripcion: 'Incluye las últimas preguntas/respuestas de la sesión como contexto (memoria de turnos)' },
  { clave: 'memory_max_turnos', valor: '4', tipo: 'number', descripcion: 'Número máximo de turnos previos incluidos en la memoria de conversación' },
  { clave: 'chunk_size', valor: '1000', tipo: 'number', descripcion: 'Tamaño (en caracteres) de cada fragmento al indexar nuevos PDFs (mín. 100)' },
  { clave: 'chunk_overlap', valor: '200', tipo: 'number', descripcion: 'Solapamiento (en caracteres) entre fragmentos al indexar nuevos PDFs (menor que chunk_size)' },
  { clave: 'ocr_enabled', valor: 'true', tipo: 'boolean', descripcion: 'Aplica OCR automáticamente a PDFs escaneados/sin texto legible al subirlos' },
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
