const { Model, DataTypes } = require('sequelize');

class HistoriasClinicas extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: 'historias_clinicas',
            modelName: 'HistoriasClinicas',
            schema: 'fcc_historiaclinica',
            timestamps: false,
        };
    }

    static associate(models) {
        HistoriasClinicas.belongsTo(models.Paciente, {
            foreignKey: 'id_paciente',
            as: 'paciente_historias_clinicas',
        });
    }
}

const HistoriasClinicasSchema = {
    id_historia: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
    },
    id_paciente: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    archivo: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
};

module.exports = { HistoriasClinicas, HistoriasClinicasSchema };
