const { Model, DataTypes } = require('sequelize');

class Documento extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'documento',
            modelName: 'Documento',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Documento.belongsTo(models.TipoDocumento, {
            foreignKey: 'id_tipo_documento',
            as: 'tipo_documento',
        });
        Documento.belongsTo(models.Modulo, {
            foreignKey: 'id_modulo',
            as: 'modulo',
        });
        Documento.belongsTo(models.Proceso, {
            foreignKey: 'id_proceso',
            as: 'proceso',
        });
    }
}

const DocumentoSchema = {
    id_documento: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_tipo_documento: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'tipo_documento',
            key: 'id_tipo_documento',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    id_modulo: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'modulo',
            key: 'id_modulo',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    nombre_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    url_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    responsable_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    fecha_envio_documento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fecha_recepcion_documento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fecha_revision_documento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    remitente_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    recibe_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    observaciones_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    objetivo_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { Documento, DocumentoSchema };
