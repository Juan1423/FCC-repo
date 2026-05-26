const { Model, DataTypes } = require('sequelize');

class Geo extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'geo',
            modelName: 'Geo',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Geo.belongsTo(models.Geo, {
            foreignKey: 'id_padre',
            as: 'padre',
        });

        Geo.hasMany(models.Geo, {
            foreignKey: 'id_padre',
            as: 'hijos',
        });

        if (models.Persona) {
            Geo.hasMany(models.Persona, {
                foreignKey: 'id_geo',
                as: 'personas',
            });
        }
    }
}

const GeoSchema = {
    id_geo: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    nivel: {
        type: DataTypes.ENUM('region', 'provincia', 'canton', 'parroquia'),
        allowNull: false,
    },
    id_padre: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Auto-referencia al padre en la jerarquía (NULL para nivel region)',
    },
    codigo_original: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'ID original en las tablas anteriores (region.id_region, provincia.id_provincia, etc.)',
    },
};

module.exports = { Geo, GeoSchema };
