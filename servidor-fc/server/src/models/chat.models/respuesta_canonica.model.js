'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatRespuestaCanonica extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_respuestas_canonicas',
            modelName: 'ChatRespuestaCanonica',
            schema: 'fcc_historiaclinica',
            timestamps: true,
            underscored: false,
        };
    }

    static associate(models) {
        this.belongsTo(models.ChatConversacionRevision, {
            foreignKey: 'creado_desde_revision',
            as: 'revisionOrigen',
        });
    }
}

const ChatRespuestaCanonicaSchema = {
    id_canonica: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    patron_trigger: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    embedding_trigger: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    respuesta_canonica: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    prioridad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    creado_por: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    creado_desde_revision: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    usos_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
};

module.exports = { ChatRespuestaCanonica, ChatRespuestaCanonicaSchema };
