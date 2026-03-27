const { Model, DataTypes } = require('sequelize');

class CategoriaPregunta extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'categorias_preguntas',
            modelName: 'CategoriaPregunta',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        this.hasMany(models.PreguntaAnonima, {
            foreignKey: 'id_categoria',
            as: 'preguntas'
        });
    }
}

const CategoriaPreguntaSchema = {
    id_categoria: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_categoria: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
};

module.exports = { CategoriaPregunta, CategoriaPreguntaSchema };