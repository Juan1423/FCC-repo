const { Model, DataTypes } = require('sequelize');

class Persona extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'persona',
            modelName: 'Persona',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Persona.belongsTo(models.Geo, {
            foreignKey: 'id_geo',
            as: 'geo',
        });

        Persona.belongsTo(models.TipoPersona, {
            foreignKey: 'id_tipo_persona',
            as: 'tipo_persona_persona',
        });

        Persona.belongsToMany(models.Interaccion, {
            through: models.PersonaInteraccion,
            foreignKey: 'persona_id',
            otherKey: 'interaccion_id',
        });
    }
}

const PersonaSchema = {
    id_persona: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_geo: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'FK hacia tabla geo (jerarquia: region/provincia/canton/parroquia)',
    },
    apellido_persona: {
        type: DataTypes.STRING(40),
        allowNull: true,
    },
    nombre_persona: {
        type: DataTypes.STRING(40),
        allowNull: true,
    },
    direccion_persona: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    correo_persona: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    telefono_persona: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    foto_persona: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    estado_persona: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
};

module.exports = { Persona, PersonaSchema };
