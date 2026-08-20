'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatDocumento extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_documentos',
            modelName: 'ChatDocumento',
            schema: 'fcc_historiaclinica',
            timestamps: true,
        };
    }

    static associate(models) {
        this.hasMany(models.ChatConocimiento, {
            foreignKey: 'id_documento',
            as: 'conocimientos',
        });
    }
}

const ChatDocumentoSchema = {
    id_documento: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nombre_archivo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipo_mime: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipo: {
        type: DataTypes.ENUM('prompt', 'conocimiento'),
        allowNull: false,
        defaultValue: 'conocimiento',
    },
    estado: {
        type: DataTypes.ENUM('PROCESANDO', 'LISTO', 'ERROR'),
        allowNull: false,
        defaultValue: 'PROCESANDO',
    },
    ruta_archivo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    texto_extraido: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    chunks_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
};

module.exports = { ChatDocumento, ChatDocumentoSchema };
