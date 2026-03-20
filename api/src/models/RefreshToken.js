const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuario_id: { type: DataTypes.UUID, allowNull: false },   // ← era lavadero_id
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ip: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.STRING(500), allowNull: true },
}, {
    tableName: 'refresh_tokens',
    indexes: [
        { fields: ['token_hash'] },
        { fields: ['usuario_id'] },
        { fields: ['expires_at'] },
    ],
});

module.exports = RefreshToken;