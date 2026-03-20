const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	lavadero_id: { type: DataTypes.UUID, allowNull: false },
	nombre: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: { notEmpty: true },
	},
	telefono: { type: DataTypes.STRING, allowNull: true },
	email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
	// notas ELIMINADO
}, {
	tableName: 'clientes',
	indexes: [
		{ fields: ['lavadero_id'] },
		{ fields: ['lavadero_id', 'nombre'] },
		{ fields: ['lavadero_id', 'telefono'] },
		{ fields: ['lavadero_id', 'email'] },
	],
});

module.exports = Cliente;