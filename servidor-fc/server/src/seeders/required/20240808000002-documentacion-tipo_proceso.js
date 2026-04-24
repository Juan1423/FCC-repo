'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO "fcc_historiaclinica"."tipo_proceso" (nombre_tipo_proceso, descripcion_tipo_proceso)
      VALUES 
        ('Estratégico', 'Procesos de dirección y planificación institucional'),
        ('Misional', 'Procesos directamente relacionados con la misión de la organización'),
        ('Apoyo', 'Procesos de soporte y logística'),
        ('Evaluación', 'Procesos de seguimiento y evaluación de resultados')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      TRUNCATE "fcc_historiaclinica"."tipo_proceso" RESTART IDENTITY CASCADE
    `);
  },
};