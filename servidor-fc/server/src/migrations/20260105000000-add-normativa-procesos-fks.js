'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añadir id_tipo_normativa a la tabla normativa
    await queryInterface.addColumn({ tableName: 'normativa', schema: 'fcc_historiaclinica' }, 'id_tipo_normativa', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Añadir id_tipo_proceso e id_normativa a la tabla procesos
    await queryInterface.addColumn({ tableName: 'procesos', schema: 'fcc_historiaclinica' }, 'id_tipo_proceso', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn({ tableName: 'procesos', schema: 'fcc_historiaclinica' }, 'id_normativa', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn({ tableName: 'procesos', schema: 'fcc_historiaclinica' }, 'id_normativa');
    await queryInterface.removeColumn({ tableName: 'procesos', schema: 'fcc_historiaclinica' }, 'id_tipo_proceso');
    await queryInterface.removeColumn({ tableName: 'normativa', schema: 'fcc_historiaclinica' }, 'id_tipo_normativa');
  }
};
