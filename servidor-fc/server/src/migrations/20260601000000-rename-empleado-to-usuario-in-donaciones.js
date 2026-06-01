'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = ['donaciones_nacionales'];
    const schema = 'fcc_historiaclinica';

    for (const table of tables) {
      const [fkRows] = await queryInterface.sequelize.query(
        `SELECT tc.constraint_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
           AND tc.table_schema = kcu.table_schema
         WHERE tc.constraint_type = 'FOREIGN KEY'
           AND tc.table_schema = '${schema}'
           AND tc.table_name = '${table}'
           AND kcu.column_name = 'id_empleado'`
      );

      for (const row of fkRows) {
        await queryInterface.sequelize.query(
          `ALTER TABLE "${schema}"."${table}" DROP CONSTRAINT "${row.constraint_name}"`
        );
      }

      await queryInterface.renameColumn(
        { tableName: table, schema },
        'id_empleado',
        'id_usuario'
      );

      await queryInterface.addConstraint(table, {
        fields: ['id_usuario'],
        type: 'foreign key',
        name: `fk_${table}_id_usuario`,
        references: {
          table: { tableName: 'usuario', schema },
          field: 'id_usuario',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = ['donaciones_nacionales'];
    const schema = 'fcc_historiaclinica';

    for (const table of tables) {
      await queryInterface.removeConstraint(table, `fk_${table}_id_usuario`, { schema });

      await queryInterface.renameColumn(
        { tableName: table, schema },
        'id_usuario',
        'id_empleado'
      );

      await queryInterface.addConstraint(table, {
        fields: ['id_empleado'],
        type: 'foreign key',
        name: `fk_${table}_id_empleado`,
        references: {
          table: { tableName: 'empleado', schema },
          field: 'id_empleado',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },
};
