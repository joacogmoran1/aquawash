const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Turno = sequelize.define('Turno', {
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
	servicio_id: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	fecha: {
		type: DataTypes.DATEONLY, // Solo fecha, sin hora
		allowNull: false,
	},
	hora: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	estado: {
		type: DataTypes.ENUM('reservado', 'confirmado', 'cancelado', 'completado'),
		allowNull: false,
		defaultValue: 'reservado',
	},
	notas: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
}, {
	tableName: 'turnos',
	indexes: [
		{ fields: ['lavadero_id', 'fecha'] }, // Query frecuente: turnos del día
	],
});

module.exports = Turno;
