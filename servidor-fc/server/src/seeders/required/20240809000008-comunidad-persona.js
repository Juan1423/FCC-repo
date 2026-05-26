'use strict';

const nombres = [
  'Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Juan', 'Rosa',
  'Pedro', 'Martha', 'Diego', 'Sofía', 'Andrés', 'Elena', 'Jorge', 'Lucía',
  'Fernando', 'Isabel', 'Miguel', 'Patricia',
];

const apellidos = [
  'González', 'Rodríguez', 'López', 'Martínez', 'García', 'Pérez', 'Sánchez',
  'Ramírez', 'Torres', 'Flores', 'Rivera', 'Morales', 'Vásquez', 'Castillo',
  'Ortega', 'Mendoza', 'Jiménez', 'Reyes', 'Vega', 'Cruz',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [geoParroquias] = await queryInterface.sequelize.query(
      "SELECT id_geo FROM fcc_historiaclinica.geo WHERE nivel = 'parroquia'"
    );
    const [tiposPersona] = await queryInterface.sequelize.query(
      'SELECT id_tipo_persona FROM fcc_historiaclinica.tipo_persona'
    );
    const used = new Set();

    if (geoParroquias.length > 0 && tiposPersona.length > 0) {
      const personas = [];
      for (let i = 0; i < 10; i++) {
        let key;
        let nombre;
        let apellido;
        do {
          nombre = pick(nombres);
          apellido = pick(apellidos);
          key = `${nombre}_${apellido}`;
        } while (used.has(key));
        used.add(key);

        personas.push({
          id_geo: geoParroquias[Math.floor(Math.random() * geoParroquias.length)].id_geo,
          id_tipo_persona: tiposPersona[Math.floor(Math.random() * tiposPersona.length)].id_tipo_persona,
          nombre_persona: nombre,
          apellido_persona: apellido,
          direccion_persona: `Dirección ${i + 1}`,
          correo_persona: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@example.com`,
          telefono_persona: JSON.stringify(`09999999${i}`),
          estado_persona: 'Activo',
        });
      }
      await queryInterface.bulkInsert( {tableName: 'persona', schema: 'fcc_historiaclinica' }, personas, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete( {tableName: 'persona', schema: 'fcc_historiaclinica' }, null, {});
  }
};
