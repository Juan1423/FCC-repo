const { Model, DataTypes } = require('sequelize');

class FeedbackUsuario extends Model {
    static config(sequelize) {
        return {
            sequelize,
            // La tabla original "feedback_usuarios" será eliminada; usamos un nombre alternativo para evitar recrearla automáticamente.
            tableName: 'feedback_usuarios_desactivado',
            modelName: 'FeedbackUsuario',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
        this.belongsTo(models.Conversacion, {
            foreignKey: 'id_conversacion',
            as: 'conversacion'
        });
    }
}

const FeedbackUsuarioSchema = {
    id_feedback: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_conversacion: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    id_usuario: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports = { FeedbackUsuario, FeedbackUsuarioSchema };