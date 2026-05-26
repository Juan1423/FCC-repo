const { Model, DataTypes } = require('sequelize');

class Organizacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'organizacion',
            modelName: 'Organizacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Organizacion.belongsTo(models.TipoOrganizacion, {
            foreignKey: 'id_tipo_organizacion',
            as: 'tipo_organizacion',
        });
        Organizacion.hasMany(models.DonanteNacional, {
            foreignKey: 'id_organizacion',
            as: 'donantes_nacionales',
        });
        Organizacion.hasMany(models.DonanteInternacional, {
            foreignKey: 'id_organizacion',
            as: 'donantes_internacionales',
        });
    }
}

const OrganizacionSchema = {
    id_organizacion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    ruc: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    direccion: {
        type: DataTypes.TEXT,
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
    sitio_web: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    id_tipo_organizacion: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('activa', 'inactiva'),
        allowNull: true,
    },
};

module.exports = { Organizacion, OrganizacionSchema };
