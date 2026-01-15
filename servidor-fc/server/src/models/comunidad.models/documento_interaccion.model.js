const { Model, DataTypes } = require('sequelize');

const DOCUMENTO_INTERACCION_TABLE = 'documento_interaccion';

class DocumentoInteraccion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: DOCUMENTO_INTERACCION_TABLE,
            modelName: 'DocumentoInteraccion',            
            schema: 'fcc_historiaclinica', 
            timestamps: false,
        };
    }

    static associate(models) {
        this.belongsTo(models.Interaccion, {
            foreignKey: 'interaccion_id',
            as: 'interaccion'
        });
    }
}

const DocumentoInteraccionSchema = {
    id_documento: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.BIGINT,
    },
    interaccion_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: {
                tableName: 'interaccion',
                schema: 'fcc_historiaclinica' 
            },
            key: 'id_interaccion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    nombre_original: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    ruta_archivo: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    tipo_mime: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    tamanio_bytes: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    fecha_carga: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'ACTIVO',
    },
};

module.exports = { DocumentoInteraccion, DocumentoInteraccionSchema };