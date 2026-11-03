'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 10;
    const defaultPassword = '12345678';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const personalSalud = [
      { nombres_personal: 'Jorge',id_personal_salud: 1, apellidos_personal: 'López Gómez', email_personal: 'admin@admin.com' ,estado: true },
      { nombres_personal: 'María', id_personal_salud:2, apellidos_personal: 'Sánchez Pérez', email_personal: 'maria.sanchez@example.com',estado: true },
      { nombres_personal: 'Carlos', id_personal_salud: 3, apellidos_personal: 'Martínez Rodríguez', email_personal: 'carlos.martinez@example.com',estado: true },
      { nombres_personal: 'Ana',id_personal_salud: 4, apellidos_personal: 'García Fernández', email_personal: 'ana.garcia@example.com',estado: true},
      { nombres_personal: 'Luis',id_personal_salud: 5, apellidos_personal: 'Hernández Gutiérrez', email_personal: 'luis.hernandez@example.com',estado: true},
      { nombres_personal: 'Elena',id_personal_salud: 6, apellidos_personal: 'Pérez González', email_personal: 'elena.perez@example.com',estado: true },
      { nombres_personal: 'Daniel',id_personal_salud: 7, apellidos_personal: 'Ramírez Silva', email_personal: 'daniel.ramirez@example.com',estado: true },
      { nombres_personal: 'Lucía',id_personal_salud: 8, apellidos_personal: 'Gómez Martínez', email_personal: 'lucia.gomez@example.com',estado: true },
      { nombres_personal: 'Pablo',id_personal_salud: 9, apellidos_personal: 'Fernández Rodríguez', email_personal: 'pablo.fernandez@example.com',estado: true },
      { nombres_personal: 'Sofía',id_personal_salud: 10, apellidos_personal: 'Martínez López', email_personal: 'sofia.martinez@example.com',estado: true }
    ];

    const usuarios = personalSalud.map((personal) => ({
      correo_usuario: personal.email_personal,
      password_usuario: hashedPassword,
      nombre_usuario: personal.nombres_personal,
      apellido_usuario: personal.apellidos_personal,
      username_usuario: personal.email_personal.split('@')[0],
      id_personal_salud: personal.id_personal_salud,
      estado_usuario: personal.estado,
      rol_usuario: personal.nombres_personal === 'Jorge' ? 'admin' : 'personal_salud',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return queryInterface.bulkInsert({tableName: 'usuario', schema: 'fcc_historiaclinica' }, usuarios, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete({tableName: 'usuario', schema: 'fcc_historiaclinica' }, null, {});
  }
};