const { Model, DataTypes } = require('sequelize');

class Prompt extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'prompts',
            modelName: 'Prompt',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        this.hasMany(models.Conversacion, {
            foreignKey: 'id_prompt',
            as: 'conversaciones'
        });
    }
}

const PromptSchema = {
    id_prompt: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
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
        type: DataTypes.ENUM('instrucciones', 'contexto_pdf', 'global', 'otro'),
        allowNull: false,
        defaultValue: 'instrucciones',
    },
    archivo_pdf: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
};

module.exports = { Prompt, PromptSchema };