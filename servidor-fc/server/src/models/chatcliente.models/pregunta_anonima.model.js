'use strict';
const { Model, DataTypes } = require('sequelize');

class PreguntaAnonima extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'preguntas_anonimas',
            modelName: 'PreguntaAnonima',
            schema: 'fcc_historiaclinica',
            timestamps: false,
            underscored: true,
        };
    }

    static associate(models) {
        // Asociación con usuarios anónimos
        this.belongsTo(models.UsuarioAnonimo, {
            foreignKey: 'id_usuario_anonimo',
            as: 'usuarioAnonimo'
        });
        // Asociación con categorías de preguntas
        this.belongsTo(models.CategoriaPregunta, {
            foreignKey: 'id_categoria',
            as: 'categoria'
        });
    }
}

const PreguntaAnonimaSchema = {
    id_pregunta_anonima: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_usuario_anonimo: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'usuarios_anonimos',
            key: 'id_usuario_anonimo'
        }
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 20]
        }
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    pregunta: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    id_categoria: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'categorias_preguntas',
            key: 'id_categoria'
        }
    },
    fecha_pregunta: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
};

module.exports = { PreguntaAnonima, PreguntaAnonimaSchema };