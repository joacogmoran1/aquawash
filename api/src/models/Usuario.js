const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    lavadero_id: { type: DataTypes.UUID, allowNull: false },
    nombre: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    rol: {
        type: DataTypes.ENUM('owner', 'admin', 'operario'),
        allowNull: false,
        defaultValue: 'operario',
    },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    tableName: 'usuarios',
    defaultScope: {
        attributes: { exclude: ['password_hash'] },
    },
    scopes: {
        withPassword: { attributes: {} },
    },
});

module.exports = Usuario;