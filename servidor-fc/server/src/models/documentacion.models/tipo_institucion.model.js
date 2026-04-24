const { Model, DataTypes } = require('sequelize');

class TipoInstitucion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_institucion',
            modelName: 'TipoInstitucion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        TipoInstitucion.hasMany(models.Institucion, {
            foreignKey: 'id_tipo_institucion',
            as: 'tipo_institucion_institucion',
        });
    }
}

const TipoInstitucionSchema = {
    id_tipo_institucion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_tipo_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_tipo_institucion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { TipoInstitucion, TipoInstitucionSchema };
