'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatConfiguracion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_configuracion',
            modelName: 'ChatConfiguracion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        // No associations
    }
}

const ChatConfiguracionSchema = {
    clave: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    valor: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.ENUM('string', 'number', 'float', 'boolean'),
        allowNull: false,
        defaultValue: 'string',
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports = { ChatConfiguracion, ChatConfiguracionSchema };
