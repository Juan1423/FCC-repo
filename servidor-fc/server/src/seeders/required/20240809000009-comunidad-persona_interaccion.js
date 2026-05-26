'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [personas] = await queryInterface.sequelize.query(
      'SELECT id_persona FROM fcc_historiaclinica.persona'
    );
    const [interacciones] = await queryInterface.sequelize.query(
      'SELECT id_interaccion FROM fcc_historiaclinica.interaccion'
    );

    if (personas.length >= 10 && interacciones.length >= 2) {
      const personaInteraccionData = [];

      for (let i = 0; i < 10; i++) {
        personaInteraccionData.push({
          persona_id: personas[i].id_persona,
          interaccion_id: interacciones[0].id_interaccion,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      for (let i = 0; i < 3; i++) {
        personaInteraccionData.push({
          persona_id: personas[i].id_persona,
          interaccion_id: interacciones[1].id_interaccion,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await queryInterface.bulkInsert( {tableName: 'persona_interaccion', schema: 'fcc_historiaclinica' }, personaInteraccionData, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete( {tableName: 'persona_interaccion', schema: 'fcc_historiaclinica' }, null, {});
  }
};
