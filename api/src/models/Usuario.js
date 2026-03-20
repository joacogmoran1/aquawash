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

    // Verificación de email
    email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    email_verify_token: { type: DataTypes.STRING(64), allowNull: true },
    email_verify_expires: { type: DataTypes.DATE, allowNull: true },

    // Reset de contraseña
    reset_password_token: { type: DataTypes.STRING(64), allowNull: true },
    reset_password_expires: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'usuarios',
    defaultScope: {
        attributes: {
            exclude: [
                'password_hash',
                'email_verify_token', 'email_verify_expires',
                'reset_password_token', 'reset_password_expires',
            ],
        },
    },
    scopes: {
        withPassword: { attributes: {} },
    },
});

module.exports = Usuario;