const { Model, DataTypes } = require('sequelize');

class Pais extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'pais',
            modelName: 'Pais',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Pais.belongsTo(models.Continente, {
            foreignKey: 'id_continente',
            as: 'continente',
        });
        Pais.hasMany(models.Ciudad, {
            foreignKey: 'id_pais',
            as: 'ciudades',
        });
        Pais.hasMany(models.DonanteInternacional, {
            foreignKey: 'id_pais',
            as: 'donantes_internacionales',
        });
    }
}

const PaisSchema = {
    id_pais: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    id_continente: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
};

module.exports = { Pais, PaisSchema };
