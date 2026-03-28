'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añadir campos para monitorizar seguridad del chatbot
    await queryInterface.addColumn('seguridad', 'action', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Tipo de acción registrada (p.ej. chat, login, error)'
    });

    await queryInterface.addColumn('seguridad', 'status_code', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Código de estado HTTP asociado a la acción'
    });

    await queryInterface.addColumn('seguridad', 'user_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'Usuario autenticado asociado (si aplica)'
    });

    await queryInterface.addColumn('seguridad', 'id_prompt', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'Prompt usado en el chat (si aplica)'
    });

    await queryInterface.addColumn('seguridad', 'ip_address', {
      type: Sequelize.STRING(45),
      allowNull: true,
      comment: 'Dirección IP desde donde se realizó la acción'
    });

    await queryInterface.addColumn('seguridad', 'user_agent', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'User-Agent del navegador/dispositivo'
    });

    await queryInterface.addColumn('seguridad', 'browser', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Navegador detectado (Chrome, Firefox, etc.)'
    });

    await queryInterface.addColumn('seguridad', 'os', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Sistema operativo detectado (Windows, macOS, Android, iOS, etc.)'
    });

    await queryInterface.addColumn('seguridad', 'device', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Tipo de dispositivo (desktop, mobile, tablet, etc.)'
    });

    await queryInterface.addColumn('seguridad', 'referer', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Referer HTTP de la petición'
    });

    await queryInterface.addColumn('seguridad', 'headers', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Headers completos de la petición (para fraude/diagnóstico)'
    });

    // Opcionales: índices para búsquedas rápidas
    await queryInterface.addIndex('seguridad', ['action']);
    await queryInterface.addIndex('seguridad', ['status_code']);
    await queryInterface.addIndex('seguridad', ['user_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('seguridad', ['user_id']);
    await queryInterface.removeIndex('seguridad', ['status_code']);
    await queryInterface.removeIndex('seguridad', ['action']);

    await queryInterface.removeColumn('seguridad', 'headers');
    await queryInterface.removeColumn('seguridad', 'referer');
    await queryInterface.removeColumn('seguridad', 'device');
    await queryInterface.removeColumn('seguridad', 'os');
    await queryInterface.removeColumn('seguridad', 'browser');
    await queryInterface.removeColumn('seguridad', 'user_agent');
    await queryInterface.removeColumn('seguridad', 'ip_address');
    await queryInterface.removeColumn('seguridad', 'id_prompt');
    await queryInterface.removeColumn('seguridad', 'user_id');
    await queryInterface.removeColumn('seguridad', 'status_code');
    await queryInterface.removeColumn('seguridad', 'action');
  }
};
