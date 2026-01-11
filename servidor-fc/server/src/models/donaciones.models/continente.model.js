const { Model, DataTypes } = require('sequelize');

class Continente extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'continente',
            modelName: 'Continente',
            schema: 'fcc_historiaclinica',
            timestamps: false, // no incluir fecha creacion y actualizacion
        };
    }

    static associate(models) {
        /*Provincia.hasMany(models.Canton, {
            foreignKey: 'id_provincia',
            as: 'provinciacanton',
        });*/
    }

}

const ContinenteSchema = {
    id_continente:{
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_continente: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    
}

module.exports = {Continente, ContinenteSchema};