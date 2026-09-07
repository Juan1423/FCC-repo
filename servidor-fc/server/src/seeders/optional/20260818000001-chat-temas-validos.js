'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const temas = [
      {
        tema: 'informacion_fundacion',
        descripcion: 'Misión, visión, historia, valores, equipo y datos institucionales de la Fundación con Cristo.',
         embedding: null,
        activo: true,
      },
      {
        tema: 'servicios_medicos',
        descripcion: 'Medicina general, especialidades médicas, laboratorio clínico, terapias y rehabilitación, telemedicina.',
         embedding: null,
        activo: true,
      },
      {
        tema: 'horarios_ubicacion',
        descripcion: 'Horarios de atención, dirección, sucursales, contacto y ubicación de la Fundación con Cristo.',
         embedding: null,
        activo: true,
      },
      {
        tema: 'programas_comunitarios',
        descripcion: 'Programas de prevención, nutrición, bienestar mental, educación y educación comunitaria.',
         embedding: null,
        activo: true,
      },
      {
        tema: 'citas_turnos',
        descripcion: 'Agendamiento de citas, requisitos para citas, documentos necesarios y turnos disponibles.',
         embedding: null,
        activo: true,
      },
      {
        tema: 'emergencias',
        descripcion: 'Servicio de urgencias 24/7, números de emergencia y atención de emergencias médicas.',
         embedding: null,
        activo: true,
      },
      {
        tema: 'donaciones_ayuda',
        descripcion: 'Cómo aportar donaciones, transparencia de donaciones, contacto para donaciones y apoyo.',
         embedding: null,
        activo: true,
      },
    ];

    const tableName = 'chat_temas_validos';
    const rows = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM fcc_historiaclinica.${tableName} WHERE tema IN (:temas)`,
      {
        replacements: { temas: temas.map(t => t.tema) },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const existingCount = rows.length > 0 ? parseInt(rows[0].count) : 0;
    if (existingCount === 0) {
      await queryInterface.bulkInsert(
        { tableName, schema: 'fcc_historiaclinica' },
        temas,
        {}
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'chat_temas_validos', schema: 'fcc_historiaclinica' },
      { tema: ['informacion_fundacion', 'servicios_medicos', 'horarios_ubicacion', 'programas_comunitarios', 'citas_turnos', 'emergencias', 'donaciones_ayuda'] }
    );
  },
};
