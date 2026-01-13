const { Model, DataTypes } = require('sequelize');

class TipoGestion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'tipo_gestion',
            modelName: 'TipoGestion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
    
    }

}
// comentario de prueba
const TipoGestionSchema = {
    id_tipo_gestion:{
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre_tipo_gestion: {
        type: DataTypes.STRING (40),
        allowNull: true, 
    }
}

module.exports = {TipoGestion, TipoGestionSchema};
