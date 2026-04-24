const { Model, DataTypes } = require('sequelize');

class RegistrarProcesos extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'registrar_procesos',
            modelName: 'RegistrarProcesos',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        RegistrarProcesos.belongsTo(models.Proceso, {
            foreignKey: 'id_proceso',
            as: 'proceso',
        });
        RegistrarProcesos.belongsTo(models.Indicador, {
            foreignKey: 'id_indicador',
            as: 'indicador',
        });
        RegistrarProcesos.belongsTo(models.DocNormativa, {
            foreignKey: 'id_normativa',
            as: 'normativa',
        });
    }
}

const RegistrarProcesosSchema = {
    id_registrar_procesos: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_proceso: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'proceso',
            key: 'id_proceso',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    id_indicador: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'indicador',
            key: 'id_indicador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    id_normativa: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'normativa',
            key: 'id_normativa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    descripcion_registrar_procesos: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    fecha_registrar_proceso: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
};

module.exports = { RegistrarProcesos, RegistrarProcesosSchema };
