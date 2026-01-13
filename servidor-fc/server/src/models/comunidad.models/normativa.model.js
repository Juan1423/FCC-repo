const { Model, DataTypes } = require('sequelize');
class Normativa extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'normativa', //---- tabla en la bdd
            modelName: 'Normativa', //---- nobmre del Modelo en el codigo
            schema: 'scprototipo', //---eesquem en la base de datos
            timestamps: false, // no incluir fecha creacion y actualizacion
        };
    }

    static associate(models) { //----relacion Provincia y Canton
        Normativa.belongsTo(models.TipoNormativa, { //---- 1 Canton pertenece a 1 Provincia / 1 Provincia n Cantones
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
            foreignKey: 'id_tipo_normativa',
            as: 'tipo_normativa_normativa',
        });
        /* Normativa.hasOne(models.Procesos, {  //------ 1 Canton tiene n Parroquia
            foreignKey: 'id_normativa',
            as: 'proceso_normativa',
        });*/
    }

}

//------------
const NormativaSchema = {
    id_normativa: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    tipo_permiso: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    nmro_resolucion_registro: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    entidad_reguladora: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    estado_cumplimiento: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    categoria_riesgo: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    archivo_digital_url: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    id_tipo_normativa: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}

module.exports = { Normativa, NormativaSchema };