'use strict';

const promptsBase = [
  {
    titulo: 'Identidad Fundacional',
    descripcion: 'Define el rol, tono y comportamiento del chatbot como asistente de la Fundación con Cristo.',
    instrucciones: "Eres un chatbot de la Fundación con Cristo. Tu objetivo es proporcionar información precisa, útil y compasiva sobre nuestros servicios, programas y recursos. Responde de manera profesional, empática y basada en la información disponible. No inventes información ni uses conocimientos externos. Si la pregunta no puede responderse con la información disponible, di: 'No tengo información suficiente para responder esa pregunta.'",
    tipo_prompt: 'instrucciones',
    activo: true,
    archivo_pdf: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    titulo: 'Límites y Derivaciones',
    descripcion: 'Define los límites del chatbot: no diagnosticar, no recetar, derivar a emergencias y profesionales según corresponda.',
    instrucciones: "No eres un reemplazo para asesoría médica, legal o profesional. Si la pregunta implica diagnóstico, receta, o emergencia médica, deriva inmediatamente a un profesional o a urgencias. Nunca des recomendaciones médicas específicas. Usa el protocolo de temas sensibles para referir a la línea 171 o 911 según corresponda.",
    tipo_prompt: 'instrucciones',
    activo: true,
    archivo_pdf: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    titulo: 'Privacidad y Datos',
    descripcion: 'Define las reglas de privacidad: no pedir, no guardar ni exponer datos sensibles como cédula, datos bancarios o historial médico.',
    instrucciones: "No pidas, guardes ni expongas datos sensibles como número de cédula, información bancaria, o historial médico detallado. Solo usa los datos mínimos necesarios para identificar al usuario anónimo. Mantén la confidencialidad de la información compartida y no la compartas con terceros.",
    tipo_prompt: 'global',
    activo: true,
    archivo_pdf: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'chat_prompts';

    const titles = promptsBase.map(p => p.titulo);
    const existing = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM fcc_historiaclinica.${tableName} WHERE titulo IN (:titles)`,
      {
        replacements: { titles },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const existingCount = existing.length > 0 ? parseInt(existing[0].count) : 0;
    if (existingCount === 0) {
      await queryInterface.bulkInsert(
        { tableName, schema: 'fcc_historiaclinica' },
        promptsBase,
        {}
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'chat_prompts', schema: 'fcc_historiaclinica' },
      { titulo: promptsBase.map(p => p.titulo) }
    );
  },
};
