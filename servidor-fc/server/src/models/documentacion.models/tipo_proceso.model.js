const { Model, DataTypes } = require('sequelize');

class DocTipoProceso extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_proceso',
            modelName: 'DocTipoProceso',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DocTipoProceso.hasMany(models.Proceso, {
            foreignKey: 'id_tipo_proceso',
            as: 'tipo_proceso_proceso',
        });
    }
}

const DocTipoProcesoSchema = {
    id_tipo_proceso: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_tipo_proceso: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_tipo_proceso: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { DocTipoProceso, DocTipoProcesoSchema };
