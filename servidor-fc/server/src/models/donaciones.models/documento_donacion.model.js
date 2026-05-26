const { Model, DataTypes } = require('sequelize');

class DocumentoDonacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'documentos_donacion',
            modelName: 'DocumentoDonacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DocumentoDonacion.belongsTo(models.DonacionNacional, {
            foreignKey: 'id_donacion_nacional',
            as: 'donacion_nacional',
        });
        DocumentoDonacion.belongsTo(models.DonacionInternacional, {
            foreignKey: 'id_donacion_internacional',
            as: 'donacion_internacional',
        });
    }
}

const DocumentoDonacionSchema = {
    id_documento: {
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
    tipo_documento: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    archivo: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fecha_subida: {
        type: DataTypes.DATE,
        allowNull: true,
    },
};

module.exports = { DocumentoDonacion, DocumentoDonacionSchema };
