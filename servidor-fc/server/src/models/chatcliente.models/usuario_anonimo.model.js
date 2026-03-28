'use strict';
const { Model, DataTypes } = require('sequelize');

class UsuarioAnonimo extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'usuarios_anonimos',
            modelName: 'UsuarioAnonimo',
            schema: 'fcc_historiaclinica',
            timestamps: false,
            underscored: true,
            hooks: {
              beforeUpdate: (usuario) => {
                usuario.ultima_actividad = new Date();
              }
            }
        };
    }

    static associate(models) {
      // Asociación con conversaciones anónimas
      UsuarioAnonimo.hasMany(models.ConversacionAnonima, {
        foreignKey: 'id_usuario_anonimo',
        as: 'conversaciones'
      });
      // Asociación con preguntas anónimas
      UsuarioAnonimo.hasMany(models.PreguntaAnonima, {
        foreignKey: 'id_usuario_anonimo',
        as: 'preguntas'
      });
    }
}

const UsuarioAnonimoSchema = {
    id_usuario_anonimo: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [5, 20] // Cédulas típicas
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
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ultima_actividad: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
};

module.exports = { UsuarioAnonimo, UsuarioAnonimoSchema };