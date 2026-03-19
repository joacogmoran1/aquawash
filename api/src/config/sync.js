require('dotenv').config();
const sequelize = require('./database');

// Importar todos los modelos para que Sequelize los registre
require('../models');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // alter:true actualiza tablas existentes sin borrar datos
    // En producción usar migraciones en vez de sync
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al sincronizar:', err);
    process.exit(1);
  }
}

sync();
