const { Model, DataTypes } = require('sequelize');

class DonacionNacional extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'donaciones_nacionales',
            modelName: 'DonacionNacional',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DonacionNacional.belongsTo(models.DonanteNacional, {
            foreignKey: 'id_donante_nacional',
            as: 'donante_nacional',
        });
        DonacionNacional.belongsTo(models.TipoDonacion, {
            foreignKey: 'id_tipo_donacion',
            as: 'tipo_donacion',
        });
        DonacionNacional.belongsTo(models.Usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario_asignado',
        });
        DonacionNacional.hasMany(models.DetalleDonacion, {
            foreignKey: 'id_donacion_nacional',
            as: 'detalles_donacion',
        });
        DonacionNacional.hasMany(models.DocumentoDonacion, {
            foreignKey: 'id_donacion_nacional',
            as: 'documentos_donacion',
        });
        DonacionNacional.hasMany(models.VerificacionDonacion, {
            foreignKey: 'id_donacion_nacional',
            as: 'verificaciones_donacion',
        });
    }
}

const DonacionNacionalSchema = {
    id_donacion_nacional: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_donante_nacional: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_tipo_donacion: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_usuario: {
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

module.exports = { DonacionNacional, DonacionNacionalSchema };
