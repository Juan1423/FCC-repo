'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatConocimiento extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_conocimiento',
            modelName: 'ChatConocimiento',
            schema: 'fcc_historiaclinica',
            timestamps: true,
        };
    }

    static associate(models) {
        this.belongsTo(models.ChatDocumento, {
            foreignKey: 'id_documento',
            as: 'documento',
        });
    }
}

const ChatConocimientoSchema = {
    id_conocimiento: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.ENUM('pregunta', 'segmento'),
        allowNull: false,
        defaultValue: 'pregunta',
    },
    id_documento: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tema_principal: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    pregunta_frecuente: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    respuesta_oficial: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    chunk_index: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    embedding: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fuente_verificacion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nivel_prioridad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    estado_vigencia: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    bloqueado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
};

module.exports = { ChatConocimiento, ChatConocimientoSchema };
