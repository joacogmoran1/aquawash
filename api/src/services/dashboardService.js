const { Op, fn, col, literal } = require('sequelize');
const { OrdenLavado, Pago, Cliente } = require('../models');
const { createError } = require('../middlewares/errorHandler');

const ESTADOS_ACTIVOS = ['esperando', 'lavando', 'listo'];

function normalizeLavaderoId(lavaderoId) {
	if (typeof lavaderoId !== 'string' || !lavaderoId.trim()) {
		throw createError(400, 'lavadero_id inválido.');
	}
	return lavaderoId.trim();
}

function toSafeNumber(value) {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
}

const ARG_OFFSET_MS = -3 * 60 * 60 * 1000;

function toArgentineDate(utcDate) {
	return new Date(utcDate.getTime() + ARG_OFFSET_MS);
}

function getDayRange(date = new Date()) {
	const argDate = toArgentineDate(date);
	const y = argDate.getUTCFullYear();
	const m = argDate.getUTCMonth();
	const d = argDate.getUTCDate();

	// Inicio del día en Argentina = medianoche ARG en UTC
	const start = new Date(Date.UTC(y, m, d, 3, 0, 0, 0));     // 00:00 ARG = 03:00 UTC
	const end = new Date(Date.UTC(y, m, d + 1, 2, 59, 59, 999)); // 23:59:59.999 ARG

	return { start, end };
}

async function getDashboard(lavadero_id) {
	const safeLavaderoId = normalizeLavaderoId(lavadero_id);
	const { start: hoyInicio, end: hoyFin } = getDayRange();

	const [
		autosHoy,
		ingresosHoyRow,
		clientesNuevosHoy,
		ticketPromedioRow,
		tiempoPromedioRow,
		ordenesPorEstado,
	] = await Promise.all([
		OrdenLavado.count({
			where: {
				lavadero_id: safeLavaderoId,
				estado: 'entregado',
				hora_entrega: {
					[Op.between]: [hoyInicio, hoyFin],
				},
			},
		}),

		Pago.findOne({
			attributes: [[fn('COALESCE', fn('SUM', col('monto')), 0), 'total']],
			include: [
				{
					model: OrdenLavado,
					attributes: [],
					where: {
						lavadero_id: safeLavaderoId,
						estado: 'entregado',
						hora_entrega: {
							[Op.between]: [hoyInicio, hoyFin],
						},
					},
					required: true,
				},
			],
			raw: true,
		}),

		Cliente.count({
			where: {
				lavadero_id: safeLavaderoId,
				created_at: {
					[Op.between]: [hoyInicio, hoyFin],
				},
			},
		}),

		Pago.findOne({
			attributes: [[fn('COALESCE', fn('AVG', col('monto')), 0), 'promedio']],
			include: [
				{
					model: OrdenLavado,
					attributes: [],
					where: {
						lavadero_id: safeLavaderoId,
						estado: 'entregado',
						hora_entrega: {
							[Op.between]: [hoyInicio, hoyFin],
						},
					},
					required: true,
				},
			],
			raw: true,
		}),

		OrdenLavado.findOne({
			attributes: [
				[
					fn(
						'COALESCE',
						fn(
							'AVG',
							literal('EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) / 60')
						),
						0
					),
					'promedio_min',
				],
			],
			where: {
				lavadero_id: safeLavaderoId,
				estado: 'entregado',
				hora_inicio: { [Op.not]: null },
				hora_fin: { [Op.not]: null },
				hora_entrega: {
					[Op.between]: [hoyInicio, hoyFin],
				},
			},
			raw: true,
		}),

		OrdenLavado.findAll({
			attributes: ['estado', [fn('COUNT', col('id')), 'cantidad']],
			where: {
				lavadero_id: safeLavaderoId,
				estado: { [Op.in]: ESTADOS_ACTIVOS },
			},
			group: ['estado'],
			raw: true,
		}),
	]);

	const estadosActivos = {
		esperando: 0,
		lavando: 0,
		listo: 0,
	};

	for (const row of ordenesPorEstado) {
		if (row?.estado && Object.prototype.hasOwnProperty.call(estadosActivos, row.estado)) {
			estadosActivos[row.estado] = parseInt(row.cantidad, 10) || 0;
		}
	}

	return {
		autos_lavados_hoy: autosHoy || 0,
		ingresos_hoy: toSafeNumber(ingresosHoyRow?.total),
		clientes_nuevos_hoy: clientesNuevosHoy || 0,
		ticket_promedio: toSafeNumber(ticketPromedioRow?.promedio),
		tiempo_promedio_lavado: toSafeNumber(tiempoPromedioRow?.promedio_min),
		ordenes_activas: estadosActivos,
	};
}

async function getSemana(lavaderoId) {
	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);

	// Generar los últimos 7 días
	const dias = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(hoy);
		d.setDate(hoy.getDate() - (6 - i));
		return d;
	});

	const desde = dias[0];
	const hasta = new Date(hoy);
	hasta.setDate(hasta.getDate() + 1);

	// Traer todas las órdenes entregadas de los últimos 14 días (7 actual + 7 anterior)
	const desdeAnterior = new Date(desde);
	desdeAnterior.setDate(desdeAnterior.getDate() - 7);

	const ordenes = await OrdenLavado.findAll({
		where: {
			lavadero_id: lavaderoId,
			estado: 'entregado',
			hora_entrega: { [Op.gte]: desdeAnterior, [Op.lt]: hasta },
		},
		attributes: ['hora_entrega', 'precio', 'servicio_tipo'],
	});

	const pagos = await Pago.findAll({
		where: { estado: 'cobrado' },
		include: [{
			model: OrdenLavado,
			where: {
				lavadero_id: lavaderoId,
				hora_entrega: { [Op.gte]: desdeAnterior, [Op.lt]: hasta },
			},
			attributes: [],
		}],
		attributes: ['metodo_pago', 'monto'],
	});

	const DIAS_LABEL = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

	function agruparPorDia(fecha) {
		const d = new Date(fecha);
		d.setHours(0, 0, 0, 0);
		return d.getTime();
	}

	// Semana actual (últimos 7 días)
	const semanaActual = dias.map(dia => {
		const ts = dia.getTime();
		const del = ordenes.filter(o => agruparPorDia(o.hora_entrega) === ts);

		const ingresos = del.reduce((s, o) => s + Number(o.precio || 0), 0);
		const lavados = del.length;
		const ticketProm = lavados > 0 ? Math.round(ingresos / lavados) : 0;
		const isHoy = ts === hoy.getTime();

		return {
			day: isHoy ? 'HOY' : DIAS_LABEL[dia.getDay()],
			fecha: dia.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
			ingresos,
			lavados,
			ticketProm,
			porServicio: calcPorServicio(del),
		};
	});

	// Semana anterior (mismos 7 días, 7 días atrás)
	const semanaAnterior = dias.map(dia => {
		const ant = new Date(dia);
		ant.setDate(ant.getDate() - 7);
		const ts = ant.getTime();
		const del = ordenes.filter(o => agruparPorDia(o.hora_entrega) === ts);
		return del.reduce((s, o) => s + Number(o.precio || 0), 0);
	});

	// Totales
	const totalActual = semanaActual.reduce((s, d) => s + d.ingresos, 0);
	const totalAnterior = semanaAnterior.reduce((s, n) => s + n, 0);
	const mejorDia = semanaActual.reduce((best, d) => d.ingresos > best.ingresos ? d : best, semanaActual[0]);
	const totalLavados = semanaActual.reduce((s, d) => s + d.lavados, 0);
	const ticketPromSem = totalLavados > 0 ? Math.round(totalActual / totalLavados) : 0;

	// Por servicio (semana actual)
	const todosActual = ordenes.filter(o => agruparPorDia(o.hora_entrega) >= desde.getTime());
	const porServicio = calcPorServicio(todosActual);

	// Métodos de pago
	const metodoMap = {};
	pagos.forEach(p => {
		const m = p.metodo_pago || 'pendiente';
		metodoMap[m] = (metodoMap[m] || 0) + 1;
	});
	const totalPagos = Object.values(metodoMap).reduce((s, n) => s + n, 0) || 1;
	const metodosPago = Object.entries(metodoMap).map(([m, n]) => ({
		metodo: m,
		cantidad: n,
		pct: Math.round((n / totalPagos) * 100),
	}));

	return {
		semanaActual,
		semanaAnterior,
		resumen: {
			totalActual,
			totalAnterior,
			diffPct: totalAnterior > 0
				? Math.round(((totalActual - totalAnterior) / totalAnterior) * 100)
				: 0,
			mejorDia: { day: mejorDia.day, ingresos: mejorDia.ingresos, lavados: mejorDia.lavados },
			ticketPromSem,
			totalLavados,
		},
		porServicio,
		metodosPago,
	};
}

function calcPorServicio(ordenes) {
	const map = {};
	ordenes.forEach(o => {
		const t = o.servicio_tipo || 'otro';
		if (!map[t]) map[t] = { nombre: t, cantidad: 0, ingresos: 0 };
		map[t].cantidad++;
		map[t].ingresos += Number(o.precio || 0);
	});
	const total = Object.values(map).reduce((s, v) => s + v.cantidad, 0) || 1;
	return Object.values(map).map(v => ({
		...v,
		pct: Math.round((v.cantidad / total) * 100),
	}));
}

module.exports = { getDashboard, getSemana };