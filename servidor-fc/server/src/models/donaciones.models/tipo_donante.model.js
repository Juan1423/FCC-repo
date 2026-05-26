const { Model, DataTypes } = require('sequelize');

class TipoDonante extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_donante',
            modelName: 'TipoDonante',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        TipoDonante.hasMany(models.DonanteNacional, {
            foreignKey: 'id_tipo_donante',
            as: 'donantes_nacionales',
        });
        TipoDonante.hasMany(models.DonanteInternacional, {
            foreignKey: 'id_tipo_donante',
            as: 'donantes_internacionales',
        });
    }
}

const TipoDonanteSchema = {
    id_tipo_donante: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports = { TipoDonante, TipoDonanteSchema };
