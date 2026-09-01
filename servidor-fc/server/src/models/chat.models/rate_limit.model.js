'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatRateLimit extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_rate_limit',
            modelName: 'ChatRateLimit',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        // No associations
    }
}

const ChatRateLimitSchema = {
    id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
    },
    scope: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    identifier: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    conteo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    ventana_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reset_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
};

module.exports = { ChatRateLimit, ChatRateLimitSchema };