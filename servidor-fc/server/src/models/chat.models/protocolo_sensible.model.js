'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatProtocoloSensible extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_protocolos_sensibles',
            modelName: 'ChatProtocoloSensible',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        // No associations needed
    }
}

const ChatProtocoloSensibleSchema = {
    id_protocolo: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    palabras_clave: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    embedding_keywords: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    respuesta_canonica: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    accion_requerida: {
        type: DataTypes.ENUM('derivar_humano_inmediato', 'derivar_profesional', 'derivar_emergencia'),
        allowNull: false,
        defaultValue: 'derivar_humano_inmediato',
    },
    prioridad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
};

module.exports = { ChatProtocoloSensible, ChatProtocoloSensibleSchema };
