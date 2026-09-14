'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatRagMonitor extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_rag_monitor',
            modelName: 'ChatRagMonitor',
            schema: 'fcc_historiaclinica',
            timestamps: true,
        };
    }

    static associate(models) {
        this.belongsTo(models.ChatConversacion, {
            foreignKey: 'id_conversacion',
            as: 'conversacion',
            constraints: false,
        });
    }
}

const ChatRagMonitorSchema = {
    id_diagnostico: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    id_conversacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tipo: {
        type: DataTypes.ENUM('publico', 'interno'),
        allowNull: false,
        defaultValue: 'publico',
    },
    pregunta: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    respuesta: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    similitud_maxima: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    umbral_usado: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.7,
    },
    n_resultados: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    resultados_json: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    contexto_rag_incluido: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    flag_modelo_ignoro: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    flag_busqueda_pobre: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    respuesta_insuficiente: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    decision: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    modelo: {
        type: DataTypes.STRING(80),
        allowNull: true,
    },
    fecha_diagnostico: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
};

module.exports = { ChatRagMonitor, ChatRagMonitorSchema };