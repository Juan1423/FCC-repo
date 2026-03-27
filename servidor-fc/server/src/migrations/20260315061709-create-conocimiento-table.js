'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conocimiento', {
      id_conocimiento: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      tema_principal: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      pregunta_frecuente: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      variaciones_pregunta: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
          isJSON(value) {
            if (value) {
              try {
                JSON.parse(value);
              } catch (e) {
                throw new Error('variaciones_pregunta debe ser un JSON válido');
              }
            }
          }
        }
      },
      respuesta_oficial: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      contexto_obligatorio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      regla_de_negacion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fuente_verificacion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      nivel_prioridad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      estado_vigencia: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('conocimiento', ['tema_principal']);
    await queryInterface.addIndex('conocimiento', ['estado_vigencia']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conocimiento');
  }
};