const { Model, DataTypes } = require('sequelize');

class DocNormativa extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'normativa',
            modelName: 'DocNormativa',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DocNormativa.belongsTo(models.DocTipoNormativa, {
            foreignKey: 'id_tipo_normativa',
            as: 'tipo_normativa_normativa',
        });
        DocNormativa.belongsTo(models.DocNormativa, {
            foreignKey: 'padre_normativa',
            as: 'normativa_padre',
        });
        DocNormativa.hasMany(models.DocNormativa, {
            foreignKey: 'padre_normativa',
            as: 'normativa_hijas',
        });
        DocNormativa.hasMany(models.RegistrarProcesos, {
            foreignKey: 'id_normativa',
            as: 'registros_normativa',
        });
    }
}

const DocNormativaSchema = {
    id_normativa: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_tipo_normativa: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'tipo_normativa',
            key: 'id_tipo_normativa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    nombre_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    descripcion_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    padre_normativa: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'normativa',
            key: 'id_normativa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    nivel_normativa: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    jerarquia_normativa: {
        type: DataTypes.STRING(120),
        allowNull: true,
    },
    archivo_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    fecha_normativa: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    fecha_modificacion_normativa: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    fecha_vigencia_normativa: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    tipo_registro_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    observaciones_normativa: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
};

module.exports = { DocNormativa, DocNormativaSchema };
