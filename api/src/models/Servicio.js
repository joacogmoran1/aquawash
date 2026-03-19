const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Servicio = sequelize.define('Servicio', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    lavadero_id: { type: DataTypes.UUID, allowNull: false },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Personalizado',
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    duracion_estimada_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: { min: 1 },
    },
    capacidad_por_hora: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'servicios',
    // Sin índice único — tipo ahora puede ser null y repetirse
});

module.exports = Servicio;