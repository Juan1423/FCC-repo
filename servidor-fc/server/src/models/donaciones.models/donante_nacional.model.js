const { Model, DataTypes } = require('sequelize');

class DonanteNacional extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'donantes_nacionales',
            modelName: 'DonanteNacional',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DonanteNacional.belongsTo(models.Region, {
            foreignKey: 'id_region',
            as: 'region',
        });
        DonanteNacional.belongsTo(models.Provincia, {
            foreignKey: 'id_provincia',
            as: 'provincia',
        });
        DonanteNacional.belongsTo(models.Canton, {
            foreignKey: 'id_canton',
            as: 'canton',
        });
        DonanteNacional.belongsTo(models.Parroquia, {
            foreignKey: 'id_parroquia',
            as: 'parroquia',
        });
        DonanteNacional.belongsTo(models.TipoDonante, {
            foreignKey: 'id_tipo_donante',
            as: 'tipo_donante',
        });
        DonanteNacional.belongsTo(models.Organizacion, {
            foreignKey: 'id_organizacion',
            as: 'organizacion',
        });
        DonanteNacional.belongsTo(models.TipoOrganizacion, {
            foreignKey: 'id_tipo_organizacion',
            as: 'tipo_organizacion',
        });
        DonanteNacional.hasMany(models.DonacionNacional, {
            foreignKey: 'id_donante_nacional',
            as: 'donaciones_nacionales',
        });
    }
}

const DonanteNacionalSchema = {
    id_donante_nacional: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombres: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    apellidos: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    identificacion: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    id_region: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_provincia: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_canton: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_parroquia: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_tipo_donante: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_organizacion: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_tipo_organizacion: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    ocupacion: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: true,
    },
};

module.exports = { DonanteNacional, DonanteNacionalSchema };
