'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatPreguntaAnonima extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_preguntas_anonimas',
            modelName: 'ChatPreguntaAnonima',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        this.belongsTo(models.ChatUsuarioAnonimo, {
            foreignKey: 'id_usuario_anonimo',
            as: 'usuarioAnonimo',
        });
    }
}

const ChatPreguntaAnonimaSchema = {
    id_pregunta_anonima: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    id_usuario_anonimo: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    pregunta: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fecha_pregunta: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
};

module.exports = { ChatPreguntaAnonima, ChatPreguntaAnonimaSchema };
