'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatConversacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_conversaciones',
            modelName: 'ChatConversacion',
            schema: 'fcc_historiaclinica',
            timestamps: true,
        };
    }

    static associate(models) {
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario',
        });
        this.belongsTo(models.ChatUsuarioAnonimo, {
            foreignKey: 'id_usuario_anonimo',
            as: 'usuarioAnonimo',
        });
        this.belongsTo(models.ChatPrompt, {
            foreignKey: 'id_prompt',
            as: 'prompt',
        });
    }
}

const ChatConversacionSchema = {
    id_conversacion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    tipo: {
        type: DataTypes.ENUM('publico', 'interno'),
        allowNull: false,
        defaultValue: 'publico',
    },
    id_usuario: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_usuario_anonimo: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    session_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_prompt: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    mensaje_usuario: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    respuesta_bot: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    consentimiento: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    tiempo_respuesta: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tokens_usados: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    flag_revision: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    motivo_revision: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fecha_conversacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
};

module.exports = { ChatConversacion, ChatConversacionSchema };
