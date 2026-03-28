'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ConversacionAnonima extends Model {
    static associate(models) {
      // Asociación con usuario anónimo (siempre que exista en el setup)
      this.belongsTo(models.UsuarioAnonimo, {
        foreignKey: 'id_usuario_anonimo',
        as: 'usuarioAnonimo'
      });
      // Asociación con conversación (para relacionar conversaciones anónimas con autenticadas)
      this.belongsTo(models.Conversacion, {
        foreignKey: 'id_conversacion',
        as: 'conversacion'
      });
    }
  }

  ConversacionAnonima.init({
    id_conversacion_anonima: {
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
    id_conversacion: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'conversaciones',
        key: 'id_conversacion'
      }
    },
    mensaje_usuario: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    respuesta_bot: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    consentimiento: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    fecha_conversacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    tiempo_respuesta: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tokens_usados: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ConversacionAnonima',
    tableName: 'conversaciones_anonimas',
    schema: 'fcc_historiaclinica',
    timestamps: false
  });

  return ConversacionAnonima;
};