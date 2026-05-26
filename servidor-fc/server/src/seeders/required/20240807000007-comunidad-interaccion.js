'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert({tableName: 'interaccion', schema: 'fcc_historiaclinica' }, [
      {
        descripcion_interaccion: 'Entrega de canasta de alimentos',
        tipo_interaccion: 'Ayuda Social',
        fecha_inicio_interaccion: new Date(),
        fecha_fin_interaccion: new Date(),
        estado_interaccion: 'Completada',
        observciones_interaccion: 'Se entregó a tiempo y en buen estado.'
      },
      {
        descripcion_interaccion: 'Taller de costura',
        tipo_interaccion: 'Capacitación',
        fecha_inicio_interaccion: new Date(),
        fecha_fin_interaccion: new Date(),
        estado_interaccion: 'En Progreso',
        observciones_interaccion: 'Asistieron 15 personas.'
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({tableName: 'interaccion', schema: 'fcc_historiaclinica' }, null, {});
  }
};
