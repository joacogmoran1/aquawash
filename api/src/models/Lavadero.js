const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lavadero = sequelize.define('Lavadero', {
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	nombre: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
	direccion: { type: DataTypes.STRING, allowNull: true },
	telefono: { type: DataTypes.STRING, allowNull: true },
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: { isEmail: true },
	},
	lun: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
	mar: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
	mie: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
	jue: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
	vie: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
	sab: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
	dom: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
	
	lun_apertura: { type: DataTypes.STRING, allowNull: true, defaultValue: '08:00' },
	lun_cierre: { type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' },
	mar_apertura: { type: DataTypes.STRING, allowNull: true, defaultValue: '08:00' },
	mar_cierre: { type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' },
	mie_apertura: { type: DataTypes.STRING, allowNull: true, defaultValue: '08:00' },
	mie_cierre: { type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' },
	jue_apertura: { type: DataTypes.STRING, allowNull: true, defaultValue: '08:00' },
	jue_cierre: { type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' },
	vie_apertura: { type: DataTypes.STRING, allowNull: true, defaultValue: '08:00' },
	vie_cierre: { type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' },
	sab_apertura: { type: DataTypes.STRING, allowNull: true, defaultValue: '08:00' },
	sab_cierre: { type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' },
	dom_apertura: { type: DataTypes.STRING, allowNull: true, defaultValue: '08:00' },
	dom_cierre: { type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' },
}, {
	tableName: 'lavaderos',
});

module.exports = Lavadero;