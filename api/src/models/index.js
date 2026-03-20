const Lavadero = require('./Lavadero');
const Usuario = require('./Usuario');
const HistorialServicio = require('./HistorialServicio');
const Cliente = require('./Cliente');
const Auto = require('./Auto');
const Servicio = require('./Servicio');
const Turno = require('./Turno');
const OrdenLavado = require('./OrdenLavado');
const Pago = require('./Pago');
const RefreshToken = require('./RefreshToken');

/* ─── Asociaciones ──────────────────────────────────────────── */

Lavadero.hasMany(Usuario, { foreignKey: 'lavadero_id', onDelete: 'CASCADE' });
Usuario.belongsTo(Lavadero, { foreignKey: 'lavadero_id' });

// RefreshToken ahora apunta a Usuario en vez de Lavadero
Usuario.hasMany(RefreshToken, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Lavadero.hasMany(Cliente, { foreignKey: 'lavadero_id', onDelete: 'CASCADE' });
Lavadero.hasMany(Auto, { foreignKey: 'lavadero_id', onDelete: 'CASCADE' });
Lavadero.hasMany(Servicio, { foreignKey: 'lavadero_id', onDelete: 'CASCADE' });
Lavadero.hasMany(Turno, { foreignKey: 'lavadero_id', onDelete: 'CASCADE' });
Lavadero.hasMany(OrdenLavado, { foreignKey: 'lavadero_id', onDelete: 'CASCADE' });
Lavadero.hasMany(HistorialServicio, { foreignKey: 'lavadero_id', onDelete: 'CASCADE' });

HistorialServicio.belongsTo(Lavadero, { foreignKey: 'lavadero_id' });
HistorialServicio.belongsTo(Cliente, { foreignKey: 'cliente_id' });
HistorialServicio.belongsTo(Auto, { foreignKey: 'auto_id' });

Cliente.belongsTo(Lavadero, { foreignKey: 'lavadero_id' });
Cliente.hasMany(Auto, { foreignKey: 'cliente_id', onDelete: 'CASCADE' });
Cliente.hasMany(Turno, { foreignKey: 'cliente_id' });
Cliente.hasMany(OrdenLavado, { foreignKey: 'cliente_id' });
Cliente.hasMany(HistorialServicio, { foreignKey: 'cliente_id', onDelete: 'CASCADE' });

Auto.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Auto.belongsTo(Lavadero, { foreignKey: 'lavadero_id' });
Auto.hasMany(Turno, { foreignKey: 'auto_id' });
Auto.hasMany(OrdenLavado, { foreignKey: 'auto_id' });
Auto.hasMany(HistorialServicio, { foreignKey: 'auto_id', onDelete: 'SET NULL' });

Servicio.belongsTo(Lavadero, { foreignKey: 'lavadero_id' });
Servicio.hasMany(Turno, { foreignKey: 'servicio_id' });

Turno.belongsTo(Lavadero, { foreignKey: 'lavadero_id' });
Turno.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Turno.belongsTo(Auto, { foreignKey: 'auto_id' });
Turno.belongsTo(Servicio, { foreignKey: 'servicio_id' });
Turno.hasOne(OrdenLavado, { foreignKey: 'turno_id' });

OrdenLavado.belongsTo(Lavadero, { foreignKey: 'lavadero_id' });
OrdenLavado.belongsTo(Cliente, { foreignKey: 'cliente_id' });
OrdenLavado.belongsTo(Auto, { foreignKey: 'auto_id' });
OrdenLavado.belongsTo(Turno, { foreignKey: 'turno_id', constraints: false });
OrdenLavado.belongsTo(Servicio, { foreignKey: 'servicio_id', constraints: false });
OrdenLavado.hasOne(Pago, { foreignKey: 'orden_id', onDelete: 'CASCADE' });

Pago.belongsTo(OrdenLavado, { foreignKey: 'orden_id' });

module.exports = {
	Lavadero, Usuario, HistorialServicio,
	Cliente, Auto, Servicio, Turno,
	OrdenLavado, Pago, RefreshToken,
};