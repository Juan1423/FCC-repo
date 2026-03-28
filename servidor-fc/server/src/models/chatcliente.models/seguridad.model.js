const { Model, DataTypes } = require('sequelize');

class Seguridad extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'seguridad',
            modelName: 'Seguridad',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        this.belongsTo(models.Conversacion, {
            foreignKey: 'id_conversacion',
            as: 'conversacion'
        });
        this.belongsTo(models.ConversacionAnonima, {
            foreignKey: 'id_conversacion_anonima',
            as: 'conversacionAnonima'
        });
        this.belongsTo(models.Usuario, {
            foreignKey: 'user_id',
            as: 'usuario'
        });
        this.belongsTo(models.Prompt, {
            foreignKey: 'id_prompt',
            as: 'prompt'
        });
    }
}

const SeguridadSchema = {
    id_seguridad: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    // Para compatibilidad, se mantiene tipo_seguridad (histórico)
    tipo_seguridad: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    // Campo estándar actual
    action: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Acción o evento detectado (p.ej. chat, login, error)'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    configuracion: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_prompt: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    browser: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    os: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    device: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    referer: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    headers: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    id_conversacion: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'conversaciones',
            key: 'id_conversacion'
        }
    },
    id_conversacion_anonima: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'conversaciones_anonimas',
            key: 'id_conversacion_anonima'
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
};

module.exports = { Seguridad, SeguridadSchema };