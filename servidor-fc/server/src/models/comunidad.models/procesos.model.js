const { Model, DataTypes } = require('sequelize');
class Procesos extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'procesos',  //---- tabla en la bdd
            modelName: 'Procesos',//---- nobmre del Modelo en el codigo
            schema: 'fcc_historiaclinica', //---eesquem en la base de datos
            timestamps: false, // no incluir fecha creacion y actualizacion
        };
    }

    static associate(models) {  //----relacion Provincia y Canton
        Procesos.hasOne(models.Interaccion, {  //---- 1 Canton pertenece a 1 Provincia / 1 Provincia n Cantones
            foreignKey: 'id_proceso',
            as: 'interaccionprocesos',
        });
        Procesos.belongsTo(models.TipoProceso, {  //------ 1 Canton tiene n Parroquia
            foreignKey: 'id_tipo_proceso',
            as: 'tipo_proceso_proceso',
        });
                Procesos.belongsTo(models.Normativa, {  //------ 1 Canton tiene n Parroquia
            foreignKey: 'id_normativa',
            as: 'proceso_normativa',
        });
    }

}

//------------
const ProcesoSchema = {
    id_proceso:{
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    nombre_proceso: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    entregable: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    descripcion_proceso: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
        id_tipo_proceso: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_normativa: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    
}

module.exports = {Procesos, ProcesoSchema}; 