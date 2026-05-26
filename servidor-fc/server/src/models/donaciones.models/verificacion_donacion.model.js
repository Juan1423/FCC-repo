const { Model, DataTypes } = require('sequelize');

class VerificacionDonacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'verificacion_donacion',
            modelName: 'VerificacionDonacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        VerificacionDonacion.belongsTo(models.DonacionNacional, {
            foreignKey: 'id_donacion_nacional',
            as: 'donacion_nacional',
        });
        VerificacionDonacion.belongsTo(models.DonacionInternacional, {
            foreignKey: 'id_donacion_internacional',
            as: 'donacion_internacional',
        });
    }
}

const VerificacionDonacionSchema = {
    id_verificacion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_donacion_nacional: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_donacion_internacional: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    entidad_verificadora: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    responsable: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    cumple_normativa: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fecha_verificacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
};

module.exports = { VerificacionDonacion, VerificacionDonacionSchema };
