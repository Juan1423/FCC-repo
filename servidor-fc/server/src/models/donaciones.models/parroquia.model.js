const { Model, DataTypes } = require('sequelize');

class Parroquia extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'parroquia',
            modelName: 'Parroquia',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Parroquia.belongsTo(models.Canton, {
            foreignKey: 'id_canton',
            as: 'canton',
        });
        Parroquia.hasMany(models.DonanteNacional, {
            foreignKey: 'id_parroquia',
            as: 'donantes_nacionales',
        });
    }
}

const ParroquiaSchema = {
    id_parroquia: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    id_canton: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
};

module.exports = { Parroquia, ParroquiaSchema };
