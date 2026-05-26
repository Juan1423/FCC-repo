const { Model, DataTypes } = require('sequelize');

class DonacionInternacional extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'donaciones_internacionales',
            modelName: 'DonacionInternacional',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DonacionInternacional.belongsTo(models.DonanteInternacional, {
            foreignKey: 'id_donante_internacional',
            as: 'donante_internacional',
        });
        DonacionInternacional.belongsTo(models.TipoDonacion, {
            foreignKey: 'id_tipo_donacion',
            as: 'tipo_donacion',
        });
        DonacionInternacional.belongsTo(models.Empleado, {
            foreignKey: 'id_empleado',
            as: 'empleado',
        });
        DonacionInternacional.hasMany(models.DetalleDonacion, {
            foreignKey: 'id_donacion_internacional',
            as: 'detalles_donacion',
        });
        DonacionInternacional.hasMany(models.DocumentoDonacion, {
            foreignKey: 'id_donacion_internacional',
            as: 'documentos_donacion',
        });
        DonacionInternacional.hasMany(models.VerificacionDonacion, {
            foreignKey: 'id_donacion_internacional',
            as: 'verificaciones_donacion',
        });
    }
}

const DonacionInternacionalSchema = {
    id_donacion_internacional: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_donante_internacional: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_tipo_donacion: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_empleado: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    fecha_donacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    procedencia: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    institucion_respaldo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    certificacion_legal: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    comprobante: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('registrada', 'verificada', 'rechazada'),
        allowNull: true,
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports = { DonacionInternacional, DonacionInternacionalSchema };
