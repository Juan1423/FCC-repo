const { Model, DataTypes } = require('sequelize');


class DocumentoConocimiento extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'ia_documentos_conocimiento',
            modelName: 'DocumentoConocimiento',
            schema: 'fcc_historiaclinica', // Asegúrate que coincida con tu esquema
            timestamps: true
        };
    }

    
    static associate(models) {
        // Un documento tiene muchos segmentos vectoriales
        this.hasMany(models.SegmentoVector, {
            foreignKey: 'documento_id',
            as: 'segmentos'
        });
    }
    
}

const DocumentoConocimientoSchema = {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.BIGINT },
    titulo: { type: DataTypes.STRING, allowNull: false },
    nombre_archivo: { type: DataTypes.STRING, allowNull: false },
    tipo_mime: { type: DataTypes.STRING }, 
    estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' }
};

module.exports = { DocumentoConocimiento, DocumentoConocimientoSchema };