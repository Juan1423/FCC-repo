const { Model, DataTypes } = require('sequelize');

class Indicador extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'indicador',
            modelName: 'Indicador',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Indicador.belongsTo(models.TipoIndicador, {
            foreignKey: 'id_tipo_indicador',
            as: 'tipo_indicador_indicador',
        });
        Indicador.hasMany(models.RegistrarProcesos, {
            foreignKey: 'id_indicador',
            as: 'registros_indicador',
        });
    }
}

const IndicadorSchema = {
    id_indicador: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_tipo_indicador: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'tipo_indicador',
            key: 'id_tipo_indicador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    nombre_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    fecha_elaboracion_indicador: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    fecha_ultima_actualizacion_indicador: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    formula_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    variables_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    periodicidad_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    medidas_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    valor_indicador: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    objetivo_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    archivo_indicador: {
        type: DataTypes.STRING(256),
        allowNull: true,
    },
    evalua_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    estado_indicador: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    observaciones_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    fuente_indicador: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { Indicador, IndicadorSchema };
