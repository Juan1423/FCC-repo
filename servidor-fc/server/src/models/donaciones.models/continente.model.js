const { Model, DataTypes } = require('sequelize');

class Continente extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'continente',
            modelName: 'Continente',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Continente.hasMany(models.Pais, {
            foreignKey: 'id_continente',
            as: 'paises',
        });
        Continente.hasMany(models.DonanteInternacional, {
            foreignKey: 'id_continente',
            as: 'donantes_internacionales',
        });
    }
}

const ContinenteSchema = {
    id_continente: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
};

module.exports = { Continente, ContinenteSchema };
