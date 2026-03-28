'use strict';
const { Model, DataTypes } = require('sequelize');

class Conocimiento extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'conocimiento',
            modelName: 'Conocimiento',
            schema: 'fcc_historiaclinica',
            timestamps: false,
            underscored: true,
        };
    }

    static associate(models) {
        // Asociación con prompts (si existe)
        if (models.Prompt) {
            this.belongsTo(models.Prompt, {
                foreignKey: 'id_prompt',
                as: 'prompt'
            });
        }
        // Asociación con conversaciones (si existe)
        if (models.Conversacion) {
            this.belongsTo(models.Conversacion, {
                foreignKey: 'id_conversacion',
                as: 'conversacion'
            });
        }
        // Asociación con conversaciones anónimas (si existe)
        if (models.ConversacionAnonima) {
            this.belongsTo(models.ConversacionAnonima, {
                foreignKey: 'id_conversacion_anonima',
                as: 'conversacionAnonima'
            });
        }
    }
}

const ConocimientoSchema = {
    id_conocimiento: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    id_prompt: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'prompts',
            key: 'id_prompt'
        }
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
    tema_principal: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    pregunta_frecuente: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    variaciones_pregunta: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isJSON(value) {
                if (value) {
                    try {
                        JSON.parse(value);
                    } catch (e) {
                        throw new Error('variaciones_pregunta debe ser un JSON válido');
                    }
                }
            }
        }
    },
    respuesta_oficial: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    contexto_obligatorio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    regla_de_negacion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fuente_verificacion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    nivel_prioridad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    estado_vigencia: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    bloqueado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Indica si esta pregunta está bloqueada y debe mostrar mensaje de advertencia'
    },
    embedding: {
        type: DataTypes.TEXT, // Almacenar como JSON string
        allowNull: true,
        comment: 'Embedding vector generado por OpenAI para búsqueda semántica'
    }
};

module.exports = { Conocimiento, ConocimientoSchema };