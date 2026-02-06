const { Model, DataTypes } = require('sequelize');

class Documento extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'documento',
            modelName: 'Documento',
            schema: 'valeryssh',
            timestamps: false,
        };
    }
    static associate(models) {
        
        
        Documento.belongsTo(models.TipoDocumento, {
            foreignKey: 'id_tipo_documento',
            as: 'tipo_documento',
        });
    }
}

const DocumentoSchema= {
    id_documento: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },   
    
    fecha_hora: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    
    nombre_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,

    },
    url_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },

};

module.exports = { Documento, DocumentoSchema};
