const { Model, DataTypes } = require('sequelize');

class Region extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'region',
            modelName: 'Region',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Region.hasMany(models.Provincia, {
            foreignKey: 'id_region',
            as: 'provincias',
        });
        Region.hasMany(models.DonanteNacional, {
            foreignKey: 'id_region',
            as: 'donantes_nacionales',
        });
    }
}

const RegionSchema = {
    id_region: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
};

module.exports = { Region, RegionSchema };
