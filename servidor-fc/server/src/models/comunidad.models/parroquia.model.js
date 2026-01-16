const { Model, DataTypes } = require('sequelize');
class Parroquia extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'parroquia',
            modelName: 'Parroquia',
            schema: 'fcc_historiaclinica',
            timestamps: false, // no incluir fecha creacion y actualizacion
        }; //--return
    }  //-- static config

    static associate(models) {
    Parroquia.belongsTo(models.Canton, { //---relacion 1
            foreignKey: 'id_canton',
            as: 'canton_parroquia',
        });//----hasOne

	Parroquia.hasMany(models.Persona, { //-- relacion 2
            foreignKey: 'id_parroquia',
            as: 'parroquia_persona',
        });
    }  //------ clase

}

//------------
const ParroquiaSchema = {
    id_parroquia:{
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_parroquia: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    
}

module.exports = {Parroquia, ParroquiaSchema};