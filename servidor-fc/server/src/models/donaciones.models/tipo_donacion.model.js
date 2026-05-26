const { Model, DataTypes } = require('sequelize');

class TipoDonacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_donacion',
            modelName: 'TipoDonacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        TipoDonacion.hasMany(models.DonacionNacional, {
            foreignKey: 'id_tipo_donacion',
            as: 'donaciones_nacionales',
        });
        TipoDonacion.hasMany(models.DonacionInternacional, {
            foreignKey: 'id_tipo_donacion',
            as: 'donaciones_internacionales',
        });
    }
}

const TipoDonacionSchema = {
    id_tipo_donacion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    categoria: {
        type: DataTypes.ENUM('economica', 'especie'),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports = { TipoDonacion, TipoDonacionSchema };
