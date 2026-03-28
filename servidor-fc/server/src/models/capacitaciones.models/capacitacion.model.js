const { Model, DataTypes } = require('sequelize');

class Capacitacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'capacitacion',
            modelName: 'Capacitacion',
            schema: 'fcc_historiaclinica',
            timestamps: true,
        };
    }

    static associate(models) {
        if (models.Capacitador) {
            this.belongsTo(models.Capacitador, {
                foreignKey: 'capacitador_id',
                as: 'capacitador'
            });
        }
    }
}

const CapacitacionSchema = {
    id_capacitacion: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tipo: {
        type: DataTypes.ENUM('INTERNA', 'EXTERNA'),
        allowNull: false,
        defaultValue: 'INTERNA',
    },
    modalidad: {
        type: DataTypes.STRING(60),
        allowNull: true,
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lugar: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    estado: {
        type: DataTypes.STRING(40),
        allowNull: true,
        defaultValue: 'PROGRAMADA',
    },
    publico_objetivo: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    costo_estimado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    capacitador_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    }
};

module.exports = { Capacitacion, CapacitacionSchema };