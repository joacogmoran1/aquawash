const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  orden_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  monto: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // En el MVP siempre 'pendiente'. En v2 se actualiza al cobrar.
  metodo_pago: {
    type:         DataTypes.ENUM('pendiente', 'efectivo', 'tarjeta', 'transferencia', 'mercadopago'),
    allowNull:    false,
    defaultValue: 'pendiente',
  },
  // En el MVP siempre 'registrado'. En v2: 'cobrado' | 'reembolsado'.
  estado: {
    type:         DataTypes.ENUM('registrado', 'cobrado', 'reembolsado'),
    allowNull:    false,
    defaultValue: 'registrado',
  },
  fecha: {
    type:         DataTypes.DATE,
    allowNull:    false,
    defaultValue: DataTypes.NOW,
  },
  notas: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'pagos',
  indexes: [
    { fields: ['orden_id'] },
    { fields: ['fecha'] }, // Para reportes por período
  ],
});

module.exports = Pago;
