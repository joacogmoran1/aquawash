const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialServicio = sequelize.define('HistorialServicio', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    lavadero_id: { type: DataTypes.UUID, allowNull: false },
    cliente_id: { type: DataTypes.UUID, allowNull: false },
    auto_id: { type: DataTypes.UUID, allowNull: true },

    // Snapshot — datos fijos al momento de la entrega
    servicio_nombre: { type: DataTypes.STRING, allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    fecha_entrega: { type: DataTypes.DATE, allowNull: false },

    // Info del auto al momento del servicio
    auto_marca: { type: DataTypes.STRING, allowNull: true },
    auto_modelo: { type: DataTypes.STRING, allowNull: true },
    auto_patente: { type: DataTypes.STRING, allowNull: true },
}, {
    tableName: 'historial_servicios',
    indexes: [
        { fields: ['cliente_id'] },
        { fields: ['lavadero_id', 'fecha_entrega'] },
    ],
});

module.exports = HistorialServicio;