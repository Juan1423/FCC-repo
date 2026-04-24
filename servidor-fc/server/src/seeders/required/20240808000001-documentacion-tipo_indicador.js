'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tipo_indicador', [
      {
        nombre_tipo_indicador: 'Eficacia',
        descripcion_tipo_indicador: 'Indicadores que miden el grado de logro de los objetivos propuestos',
      },
      {
        nombre_tipo_indicador: 'Eficiencia',
        descripcion_tipo_indicador: 'Indicadores que miden el uso de recursos para lograr objetivos',
      },
      {
        nombre_tipo_indicador: 'Efectividad',
        descripcion_tipo_indicador: 'Indicadores que miden el cumplimiento de las metas establecidas',
      },
      {
        nombre_tipo_indicador: 'Calidad',
        descripcion_tipo_indicador: 'Indicadores que miden la satisfacción del paciente y la calidad del servicio',
      },
      {
        nombre_tipo_indicador: 'Productividad',
        descripcion_tipo_indicador: 'Indicadores que miden la cantidad de producción o servicios prestados',
      },
      {
        nombre_tipo_indicador: 'Cumplimiento',
        descripcion_tipo_indicador: 'Indicadores que miden el cumplimiento de normas y procedimientos',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tipo_indicador', null, {});
  },
};