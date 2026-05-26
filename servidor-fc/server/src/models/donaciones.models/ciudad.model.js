const { Model, DataTypes } = require('sequelize');

class Ciudad extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'ciudad',
            modelName: 'Ciudad',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Ciudad.belongsTo(models.Pais, {
            foreignKey: 'id_pais',
            as: 'pais',
        });
        Ciudad.hasMany(models.DonanteInternacional, {
            foreignKey: 'id_ciudad',
            as: 'donantes_internacionales',
        });
    }
}

const CiudadSchema = {
    id_ciudad: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    id_pais: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
};

module.exports = { Ciudad, CiudadSchema };
