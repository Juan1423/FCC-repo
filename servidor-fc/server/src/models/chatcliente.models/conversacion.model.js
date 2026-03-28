const { Model, DataTypes } = require('sequelize');

class Conversacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'conversaciones',
            modelName: 'Conversacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        this.belongsTo(models.Prompt, {
            foreignKey: 'id_prompt',
            as: 'prompt'
        });
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
        this.hasMany(models.ConversacionAnonima, {
            foreignKey: 'id_conversacion',
            as: 'conversacionesAnonimas'
        });
    }
}

const ConversacionSchema = {
    id_conversacion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_usuario: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    id_prompt: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    mensaje_usuario: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    respuesta_bot: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    consentimiento: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    fecha_conversacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
};

module.exports = { Conversacion, ConversacionSchema };
