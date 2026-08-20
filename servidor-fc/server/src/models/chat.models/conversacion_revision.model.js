'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatConversacionRevision extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_conversaciones_revision',
            modelName: 'ChatConversacionRevision',
            schema: 'fcc_historiaclinica',
            timestamps: true,
            underscored: false,
        };
    }

    static associate(models) {
        this.belongsTo(models.ChatConversacion, {
            foreignKey: 'id_conversacion',
            as: 'conversacion',
        });
        this.hasOne(models.ChatRespuestaCanonica, {
            foreignKey: 'creado_desde_revision',
            as: 'canonicaDerivada',
        });
    }
}

const ChatConversacionRevisionSchema = {
    id_revision: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    id_conversacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    trigger_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mensaje_usuario: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    respuesta_ia: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sugerencia_respuesta: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
        allowNull: false,
        defaultValue: 'pendiente',
    },
    reviewed_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
};

module.exports = { ChatConversacionRevision, ChatConversacionRevisionSchema };
