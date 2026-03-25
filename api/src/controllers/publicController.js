'use strict';

const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Lavadero, Servicio, Turno, OrdenLavado, Cliente, Auto } = require('../models');
const { createError } = require('../middlewares/errorHandler');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-() ]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;
const DNI_REGEX = /^\d{6,12}$/;
const DIAS_MAP = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const MAX_BOOK_DAYS = 90;

function san(v, max = 200) {
    if (typeof v !== 'string') return '';
    return v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}
function sanEmail(v) {
    if (typeof v !== 'string') return '';
    return v.toLowerCase().replace(/[<>\s]/g, '').trim().slice(0, 150);
}
function sanPhone(v) {
    if (typeof v !== 'string') return '';
    return v.replace(/[^\d+\-() ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 30);
}
function sanPatente(v) {
    if (typeof v !== 'string') return '';
    return v.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
}
function sanDNI(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/\D/g, '').slice(0, 12);
}
function assertUUID(v, field) {
    const s = typeof v === 'string' ? v.trim() : '';
    if (!s || !UUID_REGEX.test(s)) throw createError(400, `${field} inválido.`);
    return s;
}
function toMin(hhmm) {
    const [h, m] = String(hhmm || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}
function buildArgDatetime(fecha, hora) {
    return new Date(`${fecha}T${hora}:00-03:00`);
}

const LAVADERO_PUBLIC_ATTRS = [
    'id', 'nombre', 'direccion', 'telefono',
    'lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom',
    'lun_apertura', 'lun_cierre', 'mar_apertura', 'mar_cierre',
    'mie_apertura', 'mie_cierre', 'jue_apertura', 'jue_cierre',
    'vie_apertura', 'vie_cierre', 'sab_apertura', 'sab_cierre',
    'dom_apertura', 'dom_cierre',
];

// ── GET /public/:lavaderoId/info ───────────────────────────────────────────────
async function getInfo(req, res, next) {
    try {
        const lavaderoId = assertUUID(req.params.lavaderoId, 'lavaderoId');
        const lavadero = await Lavadero.findByPk(lavaderoId, { attributes: LAVADERO_PUBLIC_ATTRS });
        if (!lavadero) throw createError(404, 'Lavadero no encontrado.');

        const servicios = await Servicio.findAll({
            where: { lavadero_id: lavaderoId, activo: true },
            attributes: ['id', 'nombre', 'precio', 'duracion_estimada_min', 'capacidad_por_hora'],
            order: [['nombre', 'ASC']],
        });

        res.json({ lavadero, servicios });
    } catch (err) { next(err); }
}

// ── GET /public/:lavaderoId/slots ──────────────────────────────────────────────
async function getSlots(req, res, next) {
    try {
        const lavaderoId = assertUUID(req.params.lavaderoId, 'lavaderoId');
        const servicioId = assertUUID(req.query.servicio_id, 'servicio_id');
        const fecha = san(req.query.fecha || '', 10);
        if (!DATE_REGEX.test(fecha)) throw createError(400, 'fecha inválida. Formato: YYYY-MM-DD.');

        const [y, m, d] = fecha.split('-').map(Number);
        const fechaDate = new Date(y, m - 1, d);
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        if (fechaDate < todayStart) throw createError(400, 'No se pueden consultar fechas pasadas.');
        const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + MAX_BOOK_DAYS);
        if (fechaDate > maxDate) throw createError(400, 'La fecha excede el horizonte de reservas.');

        const [lavadero, servicio] = await Promise.all([
            Lavadero.findByPk(lavaderoId, { attributes: LAVADERO_PUBLIC_ATTRS }),
            Servicio.findOne({ where: { id: servicioId, lavadero_id: lavaderoId, activo: true }, attributes: ['id', 'capacidad_por_hora'] }),
        ]);
        if (!lavadero) throw createError(404, 'Lavadero no encontrado.');
        if (!servicio) throw createError(404, 'Servicio no encontrado.');

        const diaKey = DIAS_MAP[fechaDate.getDay()];
        if (!lavadero[diaKey]) return res.json({ slots: [], mensaje: 'El lavadero no abre ese día.' });

        const apertura = lavadero[`${diaKey}_apertura`] || '08:00';
        const cierre = lavadero[`${diaKey}_cierre`] || '20:00';
        const aperturaH = Math.floor(toMin(apertura) / 60);
        const cierreH = Math.floor(toMin(cierre) / 60);

        const existentes = await Turno.findAll({
            where: { lavadero_id: lavaderoId, fecha, servicio_id: servicioId, estado: { [Op.notIn]: ['cancelado'] } },
            attributes: ['hora'],
        });
        const slotCount = {};
        existentes.forEach((t) => {
            const h = parseInt(String(t.hora).split(':')[0], 10);
            slotCount[h] = (slotCount[h] || 0) + 1;
        });

        const now = new Date();
        const slots = [];
        for (let h = aperturaH; h < cierreH; h++) {
            const horaStr = `${String(h).padStart(2, '00')}:00`;
            const slotDatetime = buildArgDatetime(fecha, horaStr);
            if (slotDatetime <= now) continue;
            const ocupados = slotCount[h] || 0;
            const disponibles = servicio.capacidad_por_hora - ocupados;
            if (disponibles > 0)
                slots.push({ hora: horaStr, disponibles, capacidad: servicio.capacidad_por_hora });
        }
        res.json({ slots });
    } catch (err) { next(err); }
}

// ── POST /public/:lavaderoId/lookup ────────────────────────────────────────────
async function lookup(req, res, next) {
    try {
        const lavaderoId = assertUUID(req.params.lavaderoId, 'lavaderoId');

        const dniSafe = sanDNI(req.body.dni);
        if (!dniSafe || !DNI_REGEX.test(dniSafe))
            throw createError(400, 'El número de documento es inválido. Ingresá entre 6 y 12 dígitos sin puntos ni guiones.');

        const emailSafe = sanEmail(req.body.email || '');
        if (!emailSafe || !EMAIL_REGEX.test(emailSafe))
            throw createError(400, 'El email es inválido.');

        const lavadero = await Lavadero.findByPk(lavaderoId, { attributes: ['id'] });
        if (!lavadero) throw createError(404, 'Lavadero no encontrado.');

        const cliente = await Cliente.findOne({
            where: { lavadero_id: lavaderoId, dni: dniSafe },
            attributes: ['id', 'nombre', 'email'],
            include: [{
                model: Auto,
                attributes: ['id', 'marca', 'modelo', 'patente', 'color', 'year'],
            }],
        });

        const GENERIC_ERROR = 'Los datos ingresados no coinciden con ningún cliente registrado en este lavadero.';
        if (!cliente) throw createError(404, GENERIC_ERROR);
        if (!cliente.email || cliente.email.toLowerCase() !== emailSafe.toLowerCase())
            throw createError(404, GENERIC_ERROR);

        res.json({
            cliente_id: cliente.id,
            nombre: cliente.nombre,
            autos: cliente.Autos || [],
        });
    } catch (err) { next(err); }
}

// ── POST /public/:lavaderoId/book ──────────────────────────────────────────────
async function book(req, res, next) {
    try {
        const lavaderoId = assertUUID(req.params.lavaderoId, 'lavaderoId');
        const servicioId = assertUUID(req.body.servicio_id, 'servicio_id');

        const fechaSafe = san(req.body.fecha || '', 10);
        if (!DATE_REGEX.test(fechaSafe)) throw createError(400, 'La fecha es inválida. Formato: YYYY-MM-DD.');

        const horaSafe = san(req.body.hora || '', 5);
        if (!TIME_REGEX.test(horaSafe)) throw createError(400, 'La hora es inválida. Formato: HH:MM.');

        const horaLlegada = buildArgDatetime(fechaSafe, horaSafe);
        if (horaLlegada <= new Date()) throw createError(400, 'No se puede agendar un turno en el pasado.');
        const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + MAX_BOOK_DAYS);
        if (horaLlegada > maxDate) throw createError(400, 'La fecha excede el horizonte máximo de reservas.');

        const isReturning = !!(req.body.cliente_id);

        let clienteNuevo = null;
        let nuevoAuto = null;
        let clienteId = null;
        let autoId = null;

        if (isReturning) {
            clienteId = assertUUID(req.body.cliente_id, 'cliente_id');

            if (req.body.auto_id) {
                autoId = assertUUID(req.body.auto_id, 'auto_id');
            } else {
                const marca = san(req.body.auto_marca || '', 60);
                const modelo = san(req.body.auto_modelo || '', 80);
                const patente = sanPatente(req.body.auto_patente || '');
                if (!marca) throw createError(400, 'La marca del vehículo es requerida.');
                if (!modelo) throw createError(400, 'El modelo del vehículo es requerido.');
                if (!patente) throw createError(400, 'La patente del vehículo es requerida.');
                if (patente.replace(/\s/g, '').length < 5) throw createError(400, 'La patente no es válida.');
                const color = req.body.auto_color ? san(req.body.auto_color, 40) : null;
                let year = null;
                if (req.body.auto_year !== undefined && req.body.auto_year !== null && req.body.auto_year !== '') {
                    year = Number(req.body.auto_year);
                    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1)
                        throw createError(400, 'El año del vehículo no es válido.');
                }
                nuevoAuto = { marca, modelo, patente, color, year };
            }
        } else {
            const nombre = san(req.body.nombre, 120);
            if (nombre.length < 2) throw createError(400, 'El nombre completo es requerido (mínimo 2 caracteres).');

            const telefono = sanPhone(req.body.telefono);
            if (!telefono) throw createError(400, 'El teléfono es requerido.');
            if (!PHONE_REGEX.test(telefono)) throw createError(400, 'El teléfono contiene caracteres inválidos.');

            const emailRaw = req.body.email;
            const email = emailRaw ? sanEmail(emailRaw) : null;
            if (email && !EMAIL_REGEX.test(email)) throw createError(400, 'El email no es válido.');

            const dniRaw = req.body.dni ? sanDNI(req.body.dni) : null;
            const dni = dniRaw && DNI_REGEX.test(dniRaw) ? dniRaw : null;

            const marca = san(req.body.auto_marca || '', 60);
            const modelo = san(req.body.auto_modelo || '', 80);
            const patente = sanPatente(req.body.auto_patente || '');
            if (!marca) throw createError(400, 'La marca del vehículo es requerida.');
            if (!modelo) throw createError(400, 'El modelo del vehículo es requerido.');
            if (!patente) throw createError(400, 'La patente del vehículo es requerida.');
            if (patente.replace(/\s/g, '').length < 5) throw createError(400, 'La patente no es válida.');
            const color = req.body.auto_color ? san(req.body.auto_color, 40) : null;
            let year = null;
            if (req.body.auto_year !== undefined && req.body.auto_year !== null && req.body.auto_year !== '') {
                year = Number(req.body.auto_year);
                if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1)
                    throw createError(400, 'El año del vehículo no es válido.');
            }
            clienteNuevo = { nombre, telefono, email, dni };
            nuevoAuto = { marca, modelo, patente, color, year };
        }

        // ── Transacción ───────────────────────────────────────────────────────
        const result = await sequelize.transaction(async (t) => {
            const [lavadero, servicio] = await Promise.all([
                Lavadero.findByPk(lavaderoId, { attributes: LAVADERO_PUBLIC_ATTRS, transaction: t }),
                Servicio.findOne({ where: { id: servicioId, lavadero_id: lavaderoId, activo: true }, transaction: t }),
            ]);
            if (!lavadero) throw createError(404, 'Lavadero no encontrado.');
            if (!servicio) throw createError(404, 'Servicio no encontrado o inactivo.');

            const [y, m, d] = fechaSafe.split('-').map(Number);
            const diaKey = DIAS_MAP[new Date(y, m - 1, d).getDay()];
            if (!lavadero[diaKey]) throw createError(400, 'El lavadero no atiende ese día.');

            const apertura = lavadero[`${diaKey}_apertura`] || '00:00';
            const cierre = lavadero[`${diaKey}_cierre`] || '23:59';
            const horaMin = toMin(horaSafe);
            if (horaMin < toMin(apertura) || horaMin >= toMin(cierre))
                throw createError(400, `Horario ${horaSafe} fuera del rango de atención (${apertura}–${cierre}).`);

            // Lock de cupo
            const [hh] = horaSafe.split(':').map(Number);
            const fInicio = `${String(hh).padStart(2, '0')}:00:00`;
            const fFin = hh + 1 < 24 ? `${String(hh + 1).padStart(2, '0')}:00:00` : '23:59:59';
            const enFranja = await Turno.findAll({
                where: {
                    lavadero_id: lavaderoId, fecha: fechaSafe, servicio_id: servicioId,
                    hora: { [Op.gte]: fInicio, [Op.lt]: fFin }, estado: { [Op.notIn]: ['cancelado'] }
                },
                attributes: ['id'], transaction: t, lock: t.LOCK.UPDATE,
            });
            if (enFranja.length >= servicio.capacidad_por_hora)
                throw createError(400, 'No hay cupo disponible para ese horario. Elegí otro.');

            // ── Cliente ───────────────────────────────────────────────────────
            let cliente;
            if (isReturning) {
                cliente = await Cliente.findOne({ where: { id: clienteId, lavadero_id: lavaderoId }, transaction: t });
                if (!cliente) throw createError(403, 'Cliente no válido para este lavadero.');
            } else {
                // Si viene con DNI, verificar que no exista ya en este lavadero.
                // Si existe, el cliente no es nuevo — debe usar "Ya soy cliente".
                if (clienteNuevo.dni) {
                    const existente = await Cliente.findOne({
                        where: { lavadero_id: lavaderoId, dni: clienteNuevo.dni },
                        transaction: t,
                    });
                    if (existente) {
                        throw createError(409, 'Ya existe un cliente registrado con ese número de documento. Si ya sos cliente, usá la opción "Ya soy cliente" para identificarte.');
                    }
                }
                // Nuevo cliente — siempre crear un registro nuevo
                cliente = await Cliente.create({
                    lavadero_id: lavaderoId,
                    nombre: clienteNuevo.nombre,
                    telefono: clienteNuevo.telefono,
                    email: clienteNuevo.email || null,
                    dni: clienteNuevo.dni || null,
                }, { transaction: t });
            }

            // ── Auto ──────────────────────────────────────────────────────────
            let auto;
            if (autoId) {
                auto = await Auto.findOne({
                    where: { id: autoId, cliente_id: cliente.id, lavadero_id: lavaderoId }, transaction: t,
                });
                if (!auto) throw createError(403, 'El vehículo no pertenece a este cliente.');
            } else {
                auto = await Auto.create({
                    lavadero_id: lavaderoId, cliente_id: cliente.id,
                    marca: nuevoAuto.marca, modelo: nuevoAuto.modelo,
                    patente: nuevoAuto.patente, color: nuevoAuto.color, year: nuevoAuto.year,
                }, { transaction: t });
            }

            // ── Turno + Orden ─────────────────────────────────────────────────
            const turno = await Turno.create({
                lavadero_id: lavaderoId, cliente_id: cliente.id, auto_id: auto.id,
                servicio_id: servicioId, fecha: fechaSafe, hora: horaSafe, estado: 'reservado',
            }, { transaction: t });

            await OrdenLavado.create({
                lavadero_id: lavaderoId, cliente_id: cliente.id, auto_id: auto.id,
                turno_id: turno.id, servicio_id: servicioId, servicio_tipo: servicio.nombre,
                precio: Number(servicio.precio || 0), estado: 'agendado', hora_llegada: horaLlegada,
            }, { transaction: t });

            return {
                id: turno.id, fecha: fechaSafe, hora: horaSafe,
                servicio: servicio.nombre, precio: Number(servicio.precio || 0),
                lavadero: lavadero.nombre, auto: `${auto.marca} ${auto.modelo} · ${auto.patente}`,
            };
        });

        res.status(201).json({ mensaje: 'Turno agendado correctamente.', turno: result });
    } catch (err) { next(err); }
}

module.exports = { getInfo, getSlots, lookup, book };