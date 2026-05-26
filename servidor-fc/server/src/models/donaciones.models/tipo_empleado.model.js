const { Model, DataTypes } = require('sequelize');

class TipoEmpleado extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_empleado',
            modelName: 'TipoEmpleado',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        TipoEmpleado.hasMany(models.Empleado, {
            foreignKey: 'id_tipo_empleado',
            as: 'empleados',
        });
    }
}

const TipoEmpleadoSchema = {
    id_tipo_empleado: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports = { TipoEmpleado, TipoEmpleadoSchema };
