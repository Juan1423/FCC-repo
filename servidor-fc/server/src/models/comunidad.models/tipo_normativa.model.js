const { Model, DataTypes } = require('sequelize');
class TipoNormativa extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_normativa', //---- tabla en la bdd
            modelName: 'Tipo_normativa', //---- nobmre del Modelo en el codigo
            schema: 'scprototipo', //---eesquem en la base de datos
            timestamps: false, // no incluir fecha creacion y actualizacion
        };
    }

    static associate(models) { //----relacion Provincia y Canton
        TipoNormativa.hasOne(models.Normativa, { //---- 1 Canton pertenece a 1 Provincia / 1 Provincia n Cantones
            foreignKey: 'id_tipo_normativa',
            as: 'tipo_normativa_normativa',
        });
    }

}

//------------
const TipoNormativaSchema = {
    id_tipo_normativa: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    nombre_tipo_normativa: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    descripcion_tipo_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },

}

module.exports = { TipoNormativa, TipoNormativaSchema };