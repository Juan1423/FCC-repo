const { Model, DataTypes } = require('sequelize');

class Modulo extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'modulo',
            modelName: 'Modulo',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Modulo.hasMany(models.Documento, {
            foreignKey: 'id_modulo',
            as: 'documentos',
        });
    }
}

const ModuloSchema = {
    id_modulo: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_modulo: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    descripcion_modulo: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    estado_modulo: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'ACTIVO',
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
};

module.exports = { Modulo, ModuloSchema };
