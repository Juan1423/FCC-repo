const { Model, DataTypes } = require("sequelize");

class HistorialIA extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: "ia_historial_entrenamiento",
      modelName: "HistorialIA",
      schema: "fcc_historiaclinica",
      timestamps: true,
    };
  }

  static associate(models) {
    // Relación opcional con personal interno
    if (models.Usuario) {
      this.belongsTo(models.Usuario, {
        foreignKey: "usuario_id",
        as: "usuario",
      });
    }
  }
}

const HistorialIASchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.BIGINT,
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  input_usuario: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  output_ia: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contexto_fuente: {
    type: DataTypes.TEXT,
    comment: "IDs o Títulos de docs usados",
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
};

module.exports = { HistorialIA, HistorialIASchema };
