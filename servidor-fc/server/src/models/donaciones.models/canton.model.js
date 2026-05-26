const { Model, DataTypes } = require('sequelize');

class Canton extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'canton',
            modelName: 'Canton',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Canton.belongsTo(models.Provincia, {
            foreignKey: 'id_provincia',
            as: 'provincia',
        });
        Canton.hasMany(models.Parroquia, {
            foreignKey: 'id_canton',
            as: 'parroquias',
        });
        Canton.hasMany(models.DonanteNacional, {
            foreignKey: 'id_canton',
            as: 'donantes_nacionales',
        });
    }
}

const CantonSchema = {
    id_canton: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    id_provincia: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
};

module.exports = { Canton, CantonSchema };
