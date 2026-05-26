const { Model, DataTypes } = require('sequelize');

class ItemDonacion extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'item_donacion',
            modelName: 'ItemDonacion',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        ItemDonacion.hasMany(models.DetalleDonacion, {
            foreignKey: 'id_item',
            as: 'detalles_donacion',
        });
    }
}

const ItemDonacionSchema = {
    id_item: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    categoria: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    unidad_medida: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
};

module.exports = { ItemDonacion, ItemDonacionSchema };
