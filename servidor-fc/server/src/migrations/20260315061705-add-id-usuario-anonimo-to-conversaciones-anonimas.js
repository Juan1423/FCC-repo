'use strict';

module.exports = {
  up: async () => {
    // Esta migración es un no-op porque la tabla conversaciones_anonimas ya
    // incluye la columna id_usuario_anonimo en su creación.
    return Promise.resolve();
  },

  down: async () => {
    // No-op
    return Promise.resolve();
  }
};