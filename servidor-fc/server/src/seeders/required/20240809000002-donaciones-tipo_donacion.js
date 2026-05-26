'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'tipo_donacion', schema: 'fcc_historiaclinica' },
      [
        { nombre: 'Efectivo', categoria: 'economica', descripcion: 'Donación en dinero efectivo' },
        { nombre: 'Transferencia', categoria: 'economica', descripcion: 'Donación mediante transferencia bancaria' },
        { nombre: 'Alimentos', categoria: 'especie', descripcion: 'Donación de alimentos no perecibles' },
        { nombre: 'Ropa', categoria: 'especie', descripcion: 'Donación de vestimenta y calzado' },
        { nombre: 'Medicinas', categoria: 'especie', descripcion: 'Donación de medicamentos e insumos médicos' },
        { nombre: 'Equipamiento', categoria: 'especie', descripcion: 'Donación de equipos, muebles o tecnología' },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'tipo_donacion', schema: 'fcc_historiaclinica' },
      null,
      {}
    );
  }
};
