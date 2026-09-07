'use strict';

const { FUNDACION_PERFIL_KEY, mergeFundacion } = require('../../utils/chat.fundacion.util');

const SCHEMA = 'fcc_historiaclinica';
const TABLE = 'chat_configuracion';
const WRONG_KEYS = ['FUNDACION_PERFIL_KEY'];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const item = {
      clave: FUNDACION_PERFIL_KEY,
      valor: JSON.stringify(mergeFundacion(null)),
      tipo: 'string',
      descripcion: 'Perfil completo de la fundación (JSON) usado por el chatbot',
    };

    await queryInterface.sequelize.query(
      `DELETE FROM ${SCHEMA}.${TABLE} WHERE clave IN (:wrongKeys)`,
      {
        replacements: { wrongKeys: WRONG_KEYS },
        type: Sequelize.QueryTypes.DELETE,
      }
    );

    await queryInterface.sequelize.query(
      `INSERT INTO ${SCHEMA}.${TABLE} (clave, valor, tipo, descripcion)
       VALUES (:clave, :valor, :tipo, :descripcion)
       ON CONFLICT (clave) DO UPDATE
         SET valor = EXCLUDED.valor,
             tipo = 'string',
             descripcion = EXCLUDED.descripcion`,
      {
        replacements: item,
        type: Sequelize.QueryTypes.INSERT,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `DELETE FROM ${SCHEMA}.${TABLE} WHERE clave IN (:keys)`,
      {
        replacements: { keys: [FUNDACION_PERFIL_KEY, ...WRONG_KEYS] },
        type: Sequelize.QueryTypes.DELETE,
      }
    );
  },
};