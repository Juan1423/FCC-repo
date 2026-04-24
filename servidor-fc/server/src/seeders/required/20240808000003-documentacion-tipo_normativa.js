'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO "fcc_historiaclinica"."tipo_normativa" (nombre_tipo_normativa, descripcion_tipo_normativa)
      VALUES 
        ('Ley', 'Normativas de carácter legal expedidas por el legislativo'),
        ('Decreto', 'Normativas expedidas por el ejecutivo'),
        ('Resolución', 'Normativas expedidas por autoridades administrativas'),
        ('Acuerdo', 'Normativas internas de la institución'),
        ('Reglamento', 'Normativas que regulan funcionamiento interno'),
        ('Política', 'Lineamientos y políticas institucionales'),
        ('Protocolo', 'Procedimientos estandarizados para actividades específicas'),
        ('Guía', 'Documentos de orientación y mejores prácticas')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      TRUNCATE "fcc_historiaclinica"."tipo_normativa" RESTART IDENTITY CASCADE
    `);
  },
};