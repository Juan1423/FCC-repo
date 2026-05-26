const { Model, DataTypes } = require('sequelize');

class DetalleDonacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'detalle_donacion',
            modelName: 'DetalleDonacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        DetalleDonacion.belongsTo(models.DonacionNacional, {
            foreignKey: 'id_donacion_nacional',
            as: 'donacion_nacional',
        });
        DetalleDonacion.belongsTo(models.DonacionInternacional, {
            foreignKey: 'id_donacion_internacional',
            as: 'donacion_internacional',
        });
        DetalleDonacion.belongsTo(models.ItemDonacion, {
            foreignKey: 'id_item',
            as: 'item_donacion',
        });
    }
}

const DetalleDonacionSchema = {
    id_detalle: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_donacion_nacional: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_donacion_internacional: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_item: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    valor_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    valor_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

module.exports = { DetalleDonacion, DetalleDonacionSchema };
