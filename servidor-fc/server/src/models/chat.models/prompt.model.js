const { Model, DataTypes } = require('sequelize');

class ChatPrompt extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'chat_prompts',
            modelName: 'ChatPrompt',
            schema: 'fcc_historiaclinica',
            timestamps: true,
        };
    }

    static associate(models) {
        this.hasMany(models.ChatConversacion, {
            foreignKey: 'id_prompt',
            as: 'conversaciones',
        });
    }
}

const ChatPromptSchema = {
    id_prompt: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    instrucciones: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    tipo_prompt: {
        type: DataTypes.ENUM('instrucciones', 'contexto_pdf', 'global'),
        allowNull: false,
        defaultValue: 'instrucciones',
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    archivo_pdf: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
};

module.exports = { ChatPrompt, ChatPromptSchema };
