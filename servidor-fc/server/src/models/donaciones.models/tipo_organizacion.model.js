const { Model, DataTypes } = require('sequelize');

class TipoOrganizacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_organizacion',
            modelName: 'TipoOrganizacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        TipoOrganizacion.hasMany(models.Organizacion, {
            foreignKey: 'id_tipo_organizacion',
            as: 'organizaciones',
        });
        TipoOrganizacion.hasMany(models.DonanteNacional, {
            foreignKey: 'id_tipo_organizacion',
            as: 'donantes_nacionales',
        });
        TipoOrganizacion.hasMany(models.DonanteInternacional, {
            foreignKey: 'id_tipo_organizacion',
            as: 'donantes_internacionales',
        });
    }
}

const TipoOrganizacionSchema = {
    id_tipo_organizacion: {
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

module.exports = { TipoOrganizacion, TipoOrganizacionSchema };
