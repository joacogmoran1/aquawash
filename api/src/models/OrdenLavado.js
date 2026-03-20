const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenLavado = sequelize.define('OrdenLavado', {
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	lavadero_id: { type: DataTypes.UUID, allowNull: false },
	cliente_id: { type: DataTypes.UUID, allowNull: false },
	auto_id: { type: DataTypes.UUID, allowNull: false },
	turno_id: { type: DataTypes.UUID, allowNull: true },
	servicio_tipo: { type: DataTypes.STRING, allowNull: false },
	precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
	estado: {
		type: DataTypes.ENUM('agendado', 'esperando', 'lavando', 'listo', 'entregado', 'cancelado'),
		allowNull: false,
		defaultValue: 'agendado',
	},
	hora_llegada: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
	hora_inicio: { type: DataTypes.DATE, allowNull: true },
	hora_fin: { type: DataTypes.DATE, allowNull: true },
	hora_entrega: { type: DataTypes.DATE, allowNull: true },
	// notas ELIMINADO
}, {
	tableName: 'ordenes_lavado',
	indexes: [
		{ fields: ['lavadero_id', 'estado'] },
		{ fields: ['lavadero_id', 'hora_llegada'] },
		{ fields: ['lavadero_id', 'estado', 'hora_entrega'] },
		{ fields: ['turno_id'] },
	],
});

module.exports = OrdenLavado;