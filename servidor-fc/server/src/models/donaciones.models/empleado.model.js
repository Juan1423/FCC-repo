const { Model, DataTypes } = require('sequelize');

class Empleado extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'empleado',
            modelName: 'Empleado',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Empleado.belongsTo(models.TipoEmpleado, {
            foreignKey: 'id_tipo_empleado',
            as: 'tipo_empleado',
        });
        Empleado.hasMany(models.DonacionNacional, {
            foreignKey: 'id_empleado',
            as: 'donaciones_nacionales',
        });
        Empleado.hasMany(models.DonacionInternacional, {
            foreignKey: 'id_empleado',
            as: 'donaciones_internacionales',
        });
    }
}

const EmpleadoSchema = {
    id_empleado: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombres: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    apellidos: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    id_tipo_empleado: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    cargo: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    fecha_contratacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: true,
    },
};

module.exports = { Empleado, EmpleadoSchema };
