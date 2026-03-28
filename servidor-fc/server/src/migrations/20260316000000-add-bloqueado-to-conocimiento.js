'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conocimiento', 'bloqueado', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Indica si esta pregunta está bloqueada y debe mostrar mensaje de advertencia'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('conocimiento', 'bloqueado');
  }
};