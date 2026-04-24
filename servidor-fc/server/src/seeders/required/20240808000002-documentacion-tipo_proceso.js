'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tipo_proceso', [
      {
        nombre_tipo_proceso: 'Estratégico',
        descripcion_tipo_proceso: 'Procesos de dirección y planificación institucional',
      },
      {
        nombre_tipo_proceso: 'Misional',
        descripcion_tipo_proceso: 'Procesos directamente relacionados con la misión de la organización',
      },
      {
        nombre_tipo_proceso: 'Apoyo',
        descripcion_tipo_proceso: 'Procesos de soporte y logística',
      },
      {
        nombre_tipo_proceso: 'Evaluación',
        descripcion_tipo_proceso: 'Procesos de seguimiento y evaluación de resultados',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tipo_proceso', null, {});
  },
};