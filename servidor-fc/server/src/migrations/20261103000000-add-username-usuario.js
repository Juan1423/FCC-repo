'use strict';

const SCHEMA = 'fcc_historiaclinica';
const TABLE = 'usuario';

async function columnaExiste(queryInterface, columnName) {
  const descripcion = await queryInterface.describeTable({ tableName: TABLE, schema: SCHEMA });
  return Object.prototype.hasOwnProperty.call(descripcion, columnName);
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!(await columnaExiste(queryInterface, 'username_usuario'))) {
      await queryInterface.addColumn(
        { tableName: TABLE, schema: SCHEMA },
        'username_usuario',
        {
          type: Sequelize.STRING(250),
          allowNull: true,
          comment: 'Nombre de usuario (login) separado de los nombres personales',
        }
      );
    }

    // Filas legacy: el modal anterior guardaba el username en nombre_usuario
    // y "Nombres Apellidos" en apellido_usuario. Se normaliza moviendo el
    // username a username_usuario y separando el nombre completo en nombre
    // (primera palabra) y apellido (resto).
    await queryInterface.sequelize.query(`
      UPDATE ${SCHEMA}.${TABLE}
      SET username_usuario = nombre_usuario,
          nombre_usuario = split_part(apellido_usuario, ' ', 1),
          apellido_usuario = substring(apellido_usuario from position(' ' in apellido_usuario) + 1)
      WHERE username_usuario IS NULL
        AND nombre_usuario IS NOT NULL
        AND apellido_usuario IS NOT NULL
        AND nombre_usuario !~ '[A-Z]'
        AND nombre_usuario !~ '\\s'
        AND apellido_usuario ~ '\\s'
    `);

    // Resto de filas: se usa el prefijo del correo como nombre de usuario.
    await queryInterface.sequelize.query(`
      UPDATE ${SCHEMA}.${TABLE}
      SET username_usuario = split_part(correo_usuario, '@', 1)
      WHERE username_usuario IS NULL
        AND correo_usuario IS NOT NULL
    `);
  },

  down: async (queryInterface) => {
    if (await columnaExiste(queryInterface, 'username_usuario')) {
      await queryInterface.removeColumn({ tableName: TABLE, schema: SCHEMA }, 'username_usuario');
    }
  },
};
