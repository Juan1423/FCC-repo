'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Esta migración añade columnas a tablas que pueden no existir en instalaciones ligeras.
    // Si alguna tabla falta, la operación se omite para no bloquear el flujo.
    try {
      // Verificar y agregar FK id_usuario_anonimo a preguntas_anonimas si no existe
      let preguntasAnonimasColumns = null;
      try {
        preguntasAnonimasColumns = await queryInterface.describeTable('preguntas_anonimas');
      } catch (e) {
        // Tabla no existe, omitir
      }
      if (preguntasAnonimasColumns && !preguntasAnonimasColumns.id_usuario_anonimo) {
        await queryInterface.addColumn('preguntas_anonimas', 'id_usuario_anonimo', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'usuarios_anonimos',
            key: 'id_usuario_anonimo'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
      }

      // Verificar y agregar columnas a conocimiento si no existen
      let conocimientoColumns = null;
      try {
        conocimientoColumns = await queryInterface.describeTable('conocimiento');
      } catch (e) {
        // Tabla no existe, omitir
      }
      if (conocimientoColumns) {
        if (!conocimientoColumns.id_prompt) {
          await queryInterface.addColumn('conocimiento', 'id_prompt', {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
              model: 'prompts',
              key: 'id_prompt'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          });
        }

        if (!conocimientoColumns.id_conversacion) {
          await queryInterface.addColumn('conocimiento', 'id_conversacion', {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
              model: 'conversaciones',
              key: 'id_conversacion'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          });
        }

        if (!conocimientoColumns.id_conversacion_anonima) {
          await queryInterface.addColumn('conocimiento', 'id_conversacion_anonima', {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
              model: 'conversaciones_anonimas',
              key: 'id_conversacion_anonima'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          });
        }

        if (!conocimientoColumns.id_pregunta_anonima) {
          await queryInterface.addColumn('conocimiento', 'id_pregunta_anonima', {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
              model: 'preguntas_anonimas',
              key: 'id_pregunta_anonima'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          });
        }

        // Índices para las nuevas columnas
        if (conocimientoColumns.id_prompt) {
          await queryInterface.addIndex('conocimiento', ['id_prompt']);
        }
        if (conocimientoColumns.id_conversacion) {
          await queryInterface.addIndex('conocimiento', ['id_conversacion']);
        }
        if (conocimientoColumns.id_conversacion_anonima) {
          await queryInterface.addIndex('conocimiento', ['id_conversacion_anonima']);
        }
        if (conocimientoColumns.id_pregunta_anonima) {
          await queryInterface.addIndex('conocimiento', ['id_pregunta_anonima']);
        }
      }

      // Índices para preguntas_anonimas
      if (preguntasAnonimasColumns && preguntasAnonimasColumns.id_usuario_anonimo) {
        await queryInterface.addIndex('preguntas_anonimas', ['id_usuario_anonimo']);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('does not exist') || msg.includes('no existe')) {
        // Ignorar cuando las tablas no están presentes en esta instalación.
        return;
      }
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remover índices
      await queryInterface.removeIndex('preguntas_anonimas', ['id_usuario_anonimo']);
      await queryInterface.removeIndex('conocimiento', ['id_prompt']);
      await queryInterface.removeIndex('conocimiento', ['id_conversacion']);
      await queryInterface.removeIndex('conocimiento', ['id_conversacion_anonima']);
      await queryInterface.removeIndex('conocimiento', ['id_pregunta_anonima']);

      // Remover columnas
      await queryInterface.removeColumn('preguntas_anonimas', 'id_usuario_anonimo');
      await queryInterface.removeColumn('conocimiento', 'id_prompt');
      await queryInterface.removeColumn('conocimiento', 'id_conversacion');
      await queryInterface.removeColumn('conocimiento', 'id_conversacion_anonima');
      await queryInterface.removeColumn('conocimiento', 'id_pregunta_anonima');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('does not exist') || msg.includes('no existe')) {
        return;
      }
      throw err;
    }
  }
};