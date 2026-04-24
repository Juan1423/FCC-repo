const { Model, DataTypes } = require('sequelize');

class Institucion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'institucion',
            modelName: 'Institucion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        Institucion.belongsTo(models.TipoInstitucion, {
            foreignKey: 'id_tipo_institucion',
            as: 'tipo_institucion_institucion',
        });
    }
}

const InstitucionSchema = {
    id_institucion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_tipo_institucion: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'tipo_institucion',
            key: 'id_tipo_institucion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    nombre_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    representante_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    ruc_institucion: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    direccion_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    telefonos_institucion: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    email_institucion: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    redes_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    archivo_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    observaciones_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { Institucion, InstitucionSchema };
