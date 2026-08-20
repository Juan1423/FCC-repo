'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatTemaValido extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_temas_validos',
            modelName: 'ChatTemaValido',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        // No associations needed
    }
}

const ChatTemaValidoSchema = {
    id_tema: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    tema: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    embedding: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
};

module.exports = { ChatTemaValido, ChatTemaValidoSchema };
