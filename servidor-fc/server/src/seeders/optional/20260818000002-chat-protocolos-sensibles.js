'use strict';

const protocolos = [
  {
    categoria: 'suicidio_autolesion',
    palabras_clave: JSON.stringify([
      'suicidio', 'matarme', 'quitarte la vida', 'no quiero vivir', 'autolesion',
      'cortarme', 'sobredosis', 'pastillas para morir', 'ahorcame', 'mátame',
      'daño a mí', 'he querido morir', 'quiero morir', 'no aguanto más',
      'quiero acabar con mi vida', 'me puedo matar', 'corte con cuchilla'
    ]),
    embedding_keywords: null,
    respuesta_canonica: "Me preocupa profundamente lo que compartes. Tu vida tiene valor y hay personas que quieren ayudarte. En Ecuador: Línea 171 (salud mental, 24/7) o 911 (emergencia). También puedes escribir al 099-171-171. Por favor contacta a un profesional de salud mental. ¿Quieres que te ayude a encontrar recursos cerca de ti?",
    accion_requerida: 'derivar_humano_inmediato',
    prioridad: 1,
    activo: true,
  },
  {
    categoria: 'crisis_ansiedad',
    palabras_clave: JSON.stringify([
      'ataque de pánico', 'no respiro', 'ansiedad extrema', 'mareo fuerte',
      'taquicardia', 'miedo a morir', 'crisis de pánico', 'me ahogo de ansiedad',
      'sensación de ahogo', 'necesito aire', 'angustia extrema', 'pánico'
    ]),
    embedding_keywords: null,
    respuesta_canonica: "Parece que estás pasando por un momento de mucha ansiedad. Intenta la respiración 4-7-8: inhala 4 seg, retén 7, exhala 8, repite 4 veces. Si no mejora en 10 minutos o sientes dolor en el pecho, ve a urgencias o llama al 911. La Fundación tiene servicio de psicología - ¿quieres información para agendar cita?",
    accion_requerida: 'derivar_profesional',
    prioridad: 2,
    activo: true,
  },
  {
    categoria: 'violencia_abuso',
    palabras_clave: JSON.stringify([
      'me golpean', 'abuso sexual', 'violación', 'maltrato',
      'me amenazan', 'violencia doméstica', 'violencia intrafamiliar',
      'me pegaron', 'me obligan', 'agresión', 'violencia de género'
    ]),
    embedding_keywords: null,
    respuesta_canonica: "Lo que describes es grave y no es tu culpa. Hay ayuda disponible: 1800-VICTIMAS (1800-8428462) línea gratuita 24/7. También 911 para emergencia inmediata. La Fundación tiene programa de apoyo psicológico. ¿Quieres que te conecte con un profesional de forma confidencial?",
    accion_requerida: 'derivar_humano_inmediato',
    prioridad: 1,
    activo: true,
  },
  {
    categoria: 'emergencia_medica',
    palabras_clave: JSON.stringify([
      'dolor en el pecho', 'sangrado abundante', 'inconsciente', 'convulsión',
      'accidente', 'emergencia médica', 'no puedo respirar', 'me ahogo',
      'envenenamiento', 'dificultad respiratoria grave'
    ]),
    embedding_keywords: null,
    respuesta_canonica: "🚨 EMERGENCIA MÉDICA DETECTADA 🚨\n\nEsto requiere atención MÉDICA INMEDIATA. No soy médico.\n\nLLAMA YA AL 911 O VE A URGENCIAS. La Fundación tiene servicio de emergencias 24/7 en Av. Amazonas y Naciones Unidas, Quito.",
    accion_requerida: 'derivar_emergencia',
    prioridad: 1,
    activo: true,
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'chat_protocolos_sensibles';
    const categorias = protocolos.map(p => p.categoria);

    const rows = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM fcc_historiaclinica.${tableName} WHERE categoria IN (:categorias)`,
      {
        replacements: { categorias },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const existingCount = rows.length > 0 ? parseInt(rows[0].count) : 0;
    if (existingCount === 0) {
      await queryInterface.bulkInsert(
        { tableName, schema: 'fcc_historiaclinica' },
        protocolos,
        {}
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'chat_protocolos_sensibles', schema: 'fcc_historiaclinica' },
      { categoria: protocolos.map(p => p.categoria) }
    );
  },
};
