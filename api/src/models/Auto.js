const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auto = sequelize.define('Auto', {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  lavadero_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  cliente_id: {
    type:      DataTypes.UUID,
    allowNull: false,
  },
  marca: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  modelo: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  patente: {
    type:      DataTypes.STRING,
    allowNull: false,
    set(val) {
      // Normalizar patente a mayúsculas sin espacios
      this.setDataValue('patente', val?.toUpperCase().replace(/\s/g, ''));
    },
  },
  color: {
    type:      DataTypes.STRING,
    allowNull: true,
  },
  year: {
    type:      DataTypes.INTEGER,
    allowNull: true,
    validate:  { min: 1900, max: new Date().getFullYear() + 1 },
  },
}, {
  tableName: 'autos',
});

module.exports = Auto;
