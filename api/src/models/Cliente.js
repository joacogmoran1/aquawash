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

	// Número de documento — permite al cliente identificarse sin cuenta
	dni: {
		type: DataTypes.STRING(20),
		allowNull: true,
		set(val) {
			// Normalizar: solo dígitos, sin puntos ni guiones
			if (val === null || val === undefined || val === '') {
				this.setDataValue('dni', null);
			} else {
				this.setDataValue('dni', String(val).replace(/\D/g, '').slice(0, 20) || null);
			}
		},
	},
}, {
	tableName: 'clientes',
	indexes: [
		{ fields: ['lavadero_id'] },
		{ fields: ['lavadero_id', 'nombre'] },
		{ fields: ['lavadero_id', 'telefono'] },
		{ fields: ['lavadero_id', 'email'] },
		// Unique parcial: solo cuando dni no es null
		{ fields: ['lavadero_id', 'dni'], unique: true, where: { dni: { $ne: null } } },
	],
});

module.exports = Cliente;