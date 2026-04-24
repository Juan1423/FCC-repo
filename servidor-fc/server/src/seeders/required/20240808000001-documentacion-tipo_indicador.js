'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO "fcc_historiaclinica"."tipo_indicador" (nombre_tipo_indicador, descripcion_tipo_indicador)
      VALUES 
        ('Eficacia', 'Indicadores que miden el grado de logro de los objetivos propuestos'),
        ('Eficiencia', 'Indicadores que miden el uso de recursos para lograr objetivos'),
        ('Efectividad', 'Indicadores que miden el cumplimiento de las metas establecidas'),
        ('Calidad', 'Indicadores que miden la satisfacción del paciente y la calidad del servicio'),
        ('Productividad', 'Indicadores que miden la cantidad de producción o servicios prestados'),
        ('Cumplimiento', 'Indicadores que miden el cumplimiento de normas y procedimientos')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      TRUNCATE "fcc_historiaclinica"."tipo_indicador" RESTART IDENTITY CASCADE
    `);
  },
};