'use strict';
const { Model, DataTypes } = require('sequelize');

class ChatUsuarioAnonimo extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_usuarios_anonimos',
            modelName: 'ChatUsuarioAnonimo',
            schema: 'fcc_historiaclinica',
            timestamps: false,
            underscored: true,
            hooks: {
                beforeUpdate: (usuario) => {
                    usuario.ultima_actividad = new Date();
                },
            },
        };
    }

    static associate(models) {
        this.hasMany(models.ChatPreguntaAnonima, {
            foreignKey: 'id_usuario_anonimo',
            as: 'preguntas',
        });
    }
}

const ChatUsuarioAnonimoSchema = {
    id_usuario_anonimo: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [5, 20],
        },
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100],
        },
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    ultima_actividad: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    estado: {
        type: DataTypes.ENUM('activo', 'bloqueado'),
        allowNull: false,
        defaultValue: 'activo',
    },
};

module.exports = { ChatUsuarioAnonimo, ChatUsuarioAnonimoSchema };
