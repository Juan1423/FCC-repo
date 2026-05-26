const { Model, DataTypes } = require('sequelize');

class Provincia extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'provincia',
            modelName: 'Provincia',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Provincia.belongsTo(models.Region, {
            foreignKey: 'id_region',
            as: 'region',
        });
        Provincia.hasMany(models.Canton, {
            foreignKey: 'id_provincia',
            as: 'cantones',
        });
        Provincia.hasMany(models.DonanteNacional, {
            foreignKey: 'id_provincia',
            as: 'donantes_nacionales',
        });
    }
}

const ProvinciaSchema = {
    id_provincia: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    id_region: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
};

module.exports = { Provincia, ProvinciaSchema };
