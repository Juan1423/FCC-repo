const { Model, DataTypes } = require('sequelize');

class TipoIndicador extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_indicador',
            modelName: 'TipoIndicador',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        TipoIndicador.hasMany(models.Indicador, {
            foreignKey: 'id_tipo_indicador',
            as: 'tipo_indicador_indicador',
        });
    }
}

const TipoIndicadorSchema = {
    id_tipo_indicador: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_tipo_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_tipo_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { TipoIndicador, TipoIndicadorSchema };
