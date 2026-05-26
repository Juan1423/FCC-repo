const { Model, DataTypes } = require('sequelize');

class DonanteInternacional extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'donantes_internacionales',
            modelName: 'DonanteInternacional',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DonanteInternacional.belongsTo(models.Continente, {
            foreignKey: 'id_continente',
            as: 'continente',
        });
        DonanteInternacional.belongsTo(models.Pais, {
            foreignKey: 'id_pais',
            as: 'pais',
        });
        DonanteInternacional.belongsTo(models.Ciudad, {
            foreignKey: 'id_ciudad',
            as: 'ciudad',
        });
        DonanteInternacional.belongsTo(models.TipoDonante, {
            foreignKey: 'id_tipo_donante',
            as: 'tipo_donante',
        });
        DonanteInternacional.belongsTo(models.Organizacion, {
            foreignKey: 'id_organizacion',
            as: 'organizacion',
        });
        DonanteInternacional.belongsTo(models.TipoOrganizacion, {
            foreignKey: 'id_tipo_organizacion',
            as: 'tipo_organizacion',
        });
        DonanteInternacional.hasMany(models.DonacionInternacional, {
            foreignKey: 'id_donante_internacional',
            as: 'donaciones_internacionales',
        });
    }
}

const DonanteInternacionalSchema = {
    id_donante_internacional: {
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
        type: DataTypes.STRING(50),
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
    id_continente: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_pais: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_ciudad: {
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
    institucion_origen: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    reputacion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    verificacion_legal: {
        type: DataTypes.BOOLEAN,
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

module.exports = { DonanteInternacional, DonanteInternacionalSchema };
