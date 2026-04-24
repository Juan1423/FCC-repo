const { Model, DataTypes } = require('sequelize');

class Proceso extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'proceso',
            modelName: 'Proceso',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Proceso.belongsTo(models.DocTipoProceso, {
            foreignKey: 'id_tipo_proceso',
            as: 'tipo_proceso_proceso',
        });
        Proceso.belongsTo(models.Proceso, {
            foreignKey: 'padre_proceso',
            as: 'proceso_padre',
        });
        Proceso.hasMany(models.Proceso, {
            foreignKey: 'padre_proceso',
            as: 'proceso_hijos',
        });
        Proceso.hasMany(models.Documento, {
            foreignKey: 'id_proceso',
            as: 'documentos',
        });
        Proceso.hasMany(models.RegistrarProcesos, {
            foreignKey: 'id_proceso',
            as: 'registros_proceso',
        });
    }
}

const ProcesoSchema = {
    id_proceso: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_tipo_proceso: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'tipo_proceso',
            key: 'id_tipo_proceso',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    codigo_proceso: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    nombre_proceso: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_proceso: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    responsable_proceso: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    nivel_proceso: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    padre_proceso: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'proceso',
            key: 'id_proceso',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    estado_proceso: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    jerarquia_proceso: {
        type: DataTypes.STRING(70),
        allowNull: true,
    },
    archivo_proceso: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { Proceso, ProcesoSchema };
