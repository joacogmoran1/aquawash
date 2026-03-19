// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
export const NAV = [
	{
		id: "Dashboard",
		label: "Dashboard",
		path: "/dashboard",
		icon: "home",
	},
	{
		id: "Calendar",
		label: "Calendar",
		path: "/calendar",
		icon: "clipboard",
	},
	{
		id: "Clientes",
		label: "Clientes",
		path: "/clients",
		icon: "users",
	},
	{
		id: "Configuración",
		label: "Configuración",
		path: "/config",
		icon: "settings",
	},
];

// ─────────────────────────────────────────────
// DÍAS DE LA SEMANA
// ─────────────────────────────────────────────
export const DIAS_SEMANA = [
	{ key: "lunes", label: "Lunes" },
	{ key: "martes", label: "Martes" },
	{ key: "miercoles", label: "Miércoles" },
	{ key: "jueves", label: "Jueves" },
	{ key: "viernes", label: "Viernes" },
	{ key: "sabado", label: "Sábado" },
	{ key: "domingo", label: "Domingo" },
];

// ─────────────────────────────────────────────
// WEEKDAYS
// ─────────────────────────────────────────────
export const WEEKDAYS = [
	{ key: "lunes", label: "Lunes", short: "Lun", index: 1 },
	{ key: "martes", label: "Martes", short: "Mar", index: 2 },
	{ key: "miercoles", label: "Miércoles", short: "Mié", index: 3 },
	{ key: "jueves", label: "Jueves", short: "Jue", index: 4 },
	{ key: "viernes", label: "Viernes", short: "Vie", index: 5 },
	{ key: "sabado", label: "Sábado", short: "Sáb", index: 6 },
	{ key: "domingo", label: "Domingo", short: "Dom", index: 0 },
];

// ─────────────────────────────────────────────
// MESES
// ─────────────────────────────────────────────
export const MONTHS = [
	{ value: 0, label: "Enero", short: "Ene" },
	{ value: 1, label: "Febrero", short: "Feb" },
	{ value: 2, label: "Marzo", short: "Mar" },
	{ value: 3, label: "Abril", short: "Abr" },
	{ value: 4, label: "Mayo", short: "May" },
	{ value: 5, label: "Junio", short: "Jun" },
	{ value: 6, label: "Julio", short: "Jul" },
	{ value: 7, label: "Agosto", short: "Ago" },
	{ value: 8, label: "Septiembre", short: "Sep" },
	{ value: 9, label: "Octubre", short: "Oct" },
	{ value: 10, label: "Noviembre", short: "Nov" },
	{ value: 11, label: "Diciembre", short: "Dic" },
];

// ─────────────────────────────────────────────
// ORDER STATES (UI ready)
// ─────────────────────────────────────────────
export const ORDER_STATES = [
	{
		key: "agendado",
		label: "Agendados",
		short: "Agendado",
		color: "var(--cyan)",
		icon: "📋",
	},
	{
		key: "esperando",
		label: "En espera",
		short: "Espera",
		color: "var(--orange)",
		icon: "⏳",
	},
	{
		key: "lavando",
		label: "Lavando",
		short: "Lavado",
		color: "var(--cyan)",
		icon: "💧",
	},
	{
		key: "listo",
		label: "Listos",
		short: "Listo",
		color: "var(--green)",
		icon: "✅",
	},
	{
		key: "entregado",
		label: "Entregados",
		short: "OK",
		color: "var(--muted2)",
		icon: "🏁",
	},
	{
		key: "cancelado",
		label: "Cancelados",
		short: "Cancelado",
		color: "var(--red)",
		icon: "🚫",
	},
];

// ─────────────────────────────────────────────
// ESTADOS DE ÓRDEN (orden lógico)
// ─────────────────────────────────────────────
export const ORDER_STATUS = [
	"agendado",
	"esperando",
	"lavando",
	"listo",
	"entregado",
	"cancelado",
];


// ─────────────────────────────────────────────
// METADATA DE ESTADOS
// ─────────────────────────────────────────────
export const ORDER_STATUS_META = {
	agendado: {
		label: "Agendado",
		color: "var(--cyan)",
		icon: "calendar",
	},
	esperando: {
		label: "En espera",
		color: "var(--orange)",
		icon: "clock",
	},
	lavando: {
		label: "Lavando",
		color: "var(--cyan)",
		icon: "droplet",
	},
	listo: {
		label: "Listo",
		color: "var(--green)",
		icon: "check",
	},
	entregado: {
		label: "Entregado",
		color: "var(--muted2)",
		icon: "car",
	},
	cancelado: {
		label: "Cancelado",
		color: "var(--red)",
		icon: "x",
	},
};


// ─────────────────────────────────────────────
// FLOW DE ESTADOS (acciones)
// ─────────────────────────────────────────────
export const ORDER_STATUS_FLOW = {
	agendado: {
		next: "esperando",
		action: "Recibir",
	},
	esperando: {
		next: "lavando",
		action: "Iniciar lavado",
	},
	lavando: {
		next: "listo",
		action: "Finalizar",
	},
	listo: {
		next: "entregado",
		action: "Entregar",
	},
};


// ─────────────────────────────────────────────
// COLORES RÁPIDOS (badges)
// ─────────────────────────────────────────────
export const ORDER_STATUS_COLORS = {
	agendado: "var(--cyan)",
	esperando: "var(--orange)",
	lavando: "var(--cyan)",
	listo: "var(--green)",
	entregado: "var(--muted2)",
	cancelado: "var(--red)",
};


// ─────────────────────────────────────────────
// ESTADOS PARA FILTROS
// ─────────────────────────────────────────────
export const ORDER_FILTERS = [
	{ value: "todas", label: "Todas" },
	{ value: "agendado", label: "Agendados" },
	{ value: "esperando", label: "En espera" },
	{ value: "lavando", label: "Lavando" },
	{ value: "listo", label: "Listos" },
	{ value: "entregado", label: "Entregados" },
	{ value: "cancelado", label: "Cancelados" },
];

// ─────────────────────────────────────────────
// STATUS CARDS (Dashboard / Órdenes)
// ─────────────────────────────────────────────
export const STATUS_CARDS = [
	{
		id: "agendado",
		label: "Agendados",
		icon: "📋",
		color: "var(--cyan)",
	},
	{
		id: "esperando",
		label: "En espera",
		icon: "⏳",
		color: "var(--orange)",
	},
	{
		id: "lavando",
		label: "Lavando",
		icon: "💧",
		color: "var(--cyan)",
	},
	{
		id: "listo",
		label: "Listos",
		icon: "✅",
		color: "var(--green)",
	},
	{
		id: "entregado",
		label: "Entregados",
		icon: "🏁",
		color: "var(--muted2)",
	},
	{
		id: "cancelado",
		label: "Cancelados",
		icon: "🚫",
		color: "var(--red)",
	},
];

// ─────────────────────────────────────────────
// ESTADO FLOW (UI + acción)
// ─────────────────────────────────────────────
export const ESTADO_FLOW = {
	agendado: {
		next: "esperando",
		label: "Recibir",
		icon: "📥",
		color: "var(--cyan)",
	},
	esperando: {
		next: "lavando",
		label: "Iniciar",
		icon: "💧",
		color: "var(--orange)",
	},
	lavando: {
		next: "listo",
		label: "Finalizar",
		icon: "✅",
		color: "var(--green)",
	},
	listo: {
		next: "entregado",
		label: "Entregar",
		icon: "📦",
		color: "var(--muted2)",
	},
};


// ─────────────────────────────────────────────
// ESTADO COLORS (legacy / rápido)
// ─────────────────────────────────────────────
export const ESTADO_COLORS = {
	agendado: "var(--cyan)",
	esperando: "var(--orange)",
	lavando: "var(--cyan)",
	listo: "var(--green)",
	entregado: "var(--muted2)",
	cancelado: "var(--red)",
};

// ─────────────────────────────────────────────
// COLORES DE FILTROS
// ─────────────────────────────────────────────
export const FILTER_COLORS = {
	todas: "var(--muted2)",
	agendado: "var(--cyan)",
	esperando: "var(--orange)",
	lavando: "var(--cyan)",
	listo: "var(--green)",
	entregado: "var(--muted2)",
	cancelado: "var(--red)",
};

// ─────────────────────────────────────────────
// MINI COLORS (gráficos / UI)
// ─────────────────────────────────────────────
export const MINI_COLORS = [
	"var(--cyan)",
	"var(--green)",
	"var(--orange)",
	"var(--muted2)",
	"var(--red)",
];

// ─────────────────────────────────────────────
// MÉTODOS DE PAGO
// ─────────────────────────────────────────────
export const PAYMENT_METHODS = [
	"efectivo",
	"transferencia",
	"mercadopago",
	"tarjeta",
	"pendiente",
];

export const PAYMENT_METHOD_COLORS = {
	efectivo: "var(--green)",
	transferencia: "var(--cyan)",
	mercadopago: "var(--orange)",
	tarjeta: "var(--muted2)",
	pendiente: "var(--border2)",
};


// ─────────────────────────────────────────────
// CLIENTES - ORDENAMIENTO
// ─────────────────────────────────────────────
export const CLIENT_SORT_OPTIONS = [
	{ value: "default", label: "Ordenar por" },
	{ value: "visitas_desc", label: "Más visitas" },
	{ value: "ultima_visita_desc", label: "Última visita reciente" },
];


// ─────────────────────────────────────────────
// CLIENTES - FILTROS DE VISITA
// ─────────────────────────────────────────────
export const CLIENT_VISIT_FILTERS = [
	{ value: "todas", label: "Todas las visitas" },
	{ value: "mes", label: "Última visita: hace un mes" },
	{ value: "anio", label: "Última visita: hace un año" },
	{ value: "mas_de_un_anio", label: "Última visita: + de un año" },
];


// ─────────────────────────────────────────────
// FORMATOS / LOCALES
// ─────────────────────────────────────────────
export const DEFAULT_LOCALE = "es-AR";


// ─────────────────────────────────────────────
// UI GENERAL
// ─────────────────────────────────────────────
export const EMPTY_STATES = {
	clientes: {
		icon: "👤",
		text: "Sin clientes",
	},
	ordenes: {
		icon: "📋",
		text: "Sin órdenes",
	},
	servicios: {
		icon: "🧼",
		text: "Sin servicios",
	},
};
