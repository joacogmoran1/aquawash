const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenLavado = sequelize.define('OrdenLavado', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	lavadero_id: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	cliente_id: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	auto_id: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	turno_id: {
		type: DataTypes.UUID,
		allowNull: true, // Null si el cliente llegó sin turno
	},
	servicio_tipo: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	// Snapshot del precio al momento de crear la orden
	precio: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false,
	},
	estado: {
		type: DataTypes.ENUM('agendado', 'esperando', 'lavando', 'listo', 'entregado', 'cancelado'),
		allowNull: false,
		defaultValue: 'agendado',
	},
	hora_llegada: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
	hora_inicio: {
		type: DataTypes.DATE,
		allowNull: true, // Se completa al pasar a 'lavando'
	},
	hora_fin: {
		type: DataTypes.DATE,
		allowNull: true, // Se completa al pasar a 'listo'
	},
	hora_entrega: {
		type: DataTypes.DATE,
		allowNull: true, // Se completa al pasar a 'entregado'
	},
	notas: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
}, {
	tableName: 'ordenes_lavado',
	indexes: [
		{ fields: ['lavadero_id', 'estado'] },
		{ fields: ['lavadero_id', 'hora_llegada'] }, // Para dashboard del día
	],
});

module.exports = OrdenLavado;
