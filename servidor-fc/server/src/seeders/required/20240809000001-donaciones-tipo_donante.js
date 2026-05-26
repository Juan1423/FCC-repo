'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'tipo_donante', schema: 'fcc_historiaclinica' },
      [
        { nombre: 'Persona Natural', descripcion: 'Donante individual' },
        { nombre: 'Empresa', descripcion: 'Donante corporativo o empresarial' },
        { nombre: 'Organización', descripcion: 'ONG, fundación u organización sin fines de lucro' },
        { nombre: 'Institución Pública', descripcion: 'Entidad gubernamental o pública' },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'tipo_donante', schema: 'fcc_historiaclinica' },
      null,
      {}
    );
  }
};
