'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tipo_normativa', [
      {
        nombre_tipo_normativa: 'Ley',
        descripcion_tipo_normativa: 'Normativas de carácter legal expedidas por el legislativo',
      },
      {
        nombre_tipo_normativa: 'Decreto',
        descripcion_tipo_normativa: 'Normativas expedidas por el ejecutivo',
      },
      {
        nombre_tipo_normativa: 'Resolución',
        descripcion_tipo_normativa: 'Normativas expedidas por autoridades administrativas',
      },
      {
        nombre_tipo_normativa: 'Acuerdo',
        descripcion_tipo_normativa: 'Normativas internas de la institución',
      },
      {
        nombre_tipo_normativa: 'Reglamento',
        descripcion_tipo_normativa: 'Normativas que regulan funcionamiento interno',
      },
      {
        nombre_tipo_normativa: 'Política',
        descripcion_tipo_normativa: 'Lineamientos y políticas institucionales',
      },
      {
        nombre_tipo_normativa: 'Protocolo',
        descripcion_tipo_normativa: 'Procedimientos estandarizados para actividades específicas',
      },
      {
        nombre_tipo_normativa: 'Guía',
        descripcion_tipo_normativa: 'Documentos de orientación y mejores prácticas',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tipo_normativa', null, {});
  },
};