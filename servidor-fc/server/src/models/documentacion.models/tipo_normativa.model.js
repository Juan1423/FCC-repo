const { Model, DataTypes } = require('sequelize');

class DocTipoNormativa extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_normativa',
            modelName: 'DocTipoNormativa',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DocTipoNormativa.hasMany(models.DocNormativa, {
            foreignKey: 'id_tipo_normativa',
            as: 'tipo_normativa_normativa',
        });
    }
}

const DocTipoNormativaSchema = {
    id_tipo_normativa: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_tipo_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_tipo_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { DocTipoNormativa, DocTipoNormativaSchema };
