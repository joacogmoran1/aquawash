// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
export const NAV = [
	{
		id: "dashboard",
		label: "Dashboard",
		path: "/dashboard",
		icon: "dashboard",
	},
	{
		id: "calendar",
		label: "Calendar",
		path: "/calendar",
		icon: "calendar",
	},
	{
		id: "clients",
		label: "Clientes",
		path: "/clients",
		icon: "clients",
	},
	{
		id: "config",
		label: "Configuración",
		path: "/config",
		icon: "config",
	},
];

// ─────────────────────────────────────────────
// DÍAS DE LA SEMANA
// Claves deben coincidir EXACTAMENTE con las columnas del modelo Lavadero
// Backend usa: lun, mar, mie, jue, vie, sab, dom
// ─────────────────────────────────────────────
export const DIAS_SEMANA = [
	{ key: "lun", label: "Lunes" },
	{ key: "mar", label: "Martes" },
	{ key: "mie", label: "Miércoles" },
	{ key: "jue", label: "Jueves" },
	{ key: "vie", label: "Viernes" },
	{ key: "sab", label: "Sábado" },
	{ key: "dom", label: "Domingo" },
];

export const DIAS_ARR = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

export const MAX_DAYS = 90;

// ─────────────────────────────────────────────
// WEEKDAYS (para el grid del calendario, empieza en lunes)
// ─────────────────────────────────────────────
export const WEEKDAYS = [
	{ key: "lun", label: "Lunes", short: "Lun", index: 1 },
	{ key: "mar", label: "Martes", short: "Mar", index: 2 },
	{ key: "mie", label: "Miércoles", short: "Mié", index: 3 },
	{ key: "jue", label: "Jueves", short: "Jue", index: 4 },
	{ key: "vie", label: "Viernes", short: "Vie", index: 5 },
	{ key: "sab", label: "Sábado", short: "Sáb", index: 6 },
	{ key: "dom", label: "Domingo", short: "Dom", index: 0 },
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
	{ key: "agendado", label: "Agendados", short: "Agendado", color: "var(--cyan)", icon: "📋" },
	{ key: "esperando", label: "En espera", short: "Espera", color: "var(--orange)", icon: "⏳" },
	{ key: "lavando", label: "Lavando", short: "Lavado", color: "var(--cyan)", icon: "💧" },
	{ key: "listo", label: "Listos", short: "Listo", color: "var(--green)", icon: "✅" },
	{ key: "entregado", label: "Entregados", short: "OK", color: "var(--muted2)", icon: "🏁" },
	{ key: "cancelado", label: "Cancelados", short: "Cancelado", color: "var(--red)", icon: "🚫" },
];

export const ORDER_STATUS = [
	"agendado", "esperando", "lavando", "listo", "entregado", "cancelado",
];

export const ORDER_STATUS_META = {
	agendado: { label: "Agendado", color: "var(--cyan)", icon: "calendar" },
	esperando: { label: "En espera", color: "var(--orange)", icon: "clock" },
	lavando: { label: "Lavando", color: "var(--cyan)", icon: "droplet" },
	listo: { label: "Listo", color: "var(--green)", icon: "check" },
	entregado: { label: "Entregado", color: "var(--muted2)", icon: "car" },
	cancelado: { label: "Cancelado", color: "var(--red)", icon: "x" },
};

export const ORDER_STATUS_FLOW = {
	agendado: { next: "esperando", action: "Recibir" },
	esperando: { next: "lavando", action: "Iniciar lavado" },
	lavando: { next: "listo", action: "Finalizar" },
	listo: { next: "entregado", action: "Entregar" },
};

export const ORDER_STATUS_COLORS = {
	agendado: "var(--cyan)",
	esperando: "var(--orange)",
	lavando: "var(--cyan)",
	listo: "var(--green)",
	entregado: "var(--muted2)",
	cancelado: "var(--red)",
};

export const ORDER_FILTERS = [
	{ value: "todas", label: "Todas" },
	{ value: "agendado", label: "Agendados" },
	{ value: "esperando", label: "En espera" },
	{ value: "lavando", label: "Lavando" },
	{ value: "listo", label: "Listos" },
	{ value: "entregado", label: "Entregados" },
	{ value: "cancelado", label: "Cancelados" },
];

export const STATUS_CARDS = [
	{ id: "agendado", label: "Agendados", icon: "📋", color: "var(--cyan)" },
	{ id: "esperando", label: "En espera", icon: "⏳", color: "var(--orange)" },
	{ id: "lavando", label: "Lavando", icon: "💧", color: "var(--cyan)" },
	{ id: "listo", label: "Listos", icon: "✅", color: "var(--green)" },
	{ id: "entregado", label: "Entregados", icon: "🏁", color: "var(--muted2)" },
	{ id: "cancelado", label: "Cancelados", icon: "🚫", color: "var(--red)" },
];

export const ESTADO_FLOW = {
	agendado: { next: "esperando", label: "Recibir", icon: "📥", color: "var(--cyan)" },
	esperando: { next: "lavando", label: "Iniciar", icon: "💧", color: "var(--orange)" },
	lavando: { next: "listo", label: "Finalizar", icon: "✅", color: "var(--green)" },
	listo: { next: "entregado", label: "Entregar", icon: "📦", color: "var(--muted2)" },
};

export const ESTADO_COLORS = {
	agendado: "var(--cyan)",
	esperando: "var(--orange)",
	lavando: "var(--cyan)",
	listo: "var(--green)",
	entregado: "var(--muted2)",
	cancelado: "var(--red)",
};

export const FILTER_COLORS = {
	todas: "var(--muted2)",
	agendado: "var(--cyan)",
	esperando: "var(--orange)",
	lavando: "var(--cyan)",
	listo: "var(--green)",
	entregado: "var(--muted2)",
	cancelado: "var(--red)",
};

export const MINI_COLORS = [
	"var(--cyan)",
	"var(--green)",
	"var(--orange)",
	"var(--muted2)",
	"var(--red)",
];

export const PAYMENT_METHODS = [
	"efectivo", "transferencia", "mercadopago", "tarjeta", "pendiente",
];

export const PAYMENT_METHOD_COLORS = {
	efectivo: "var(--green)",
	transferencia: "var(--cyan)",
	mercadopago: "var(--orange)",
	tarjeta: "var(--muted2)",
	pendiente: "var(--border2)",
};

export const CLIENT_SORT_OPTIONS = [
	{ value: "default", label: "Ordenar por" },
	{ value: "visitas_desc", label: "Más visitas" },
	{ value: "ultima_visita_desc", label: "Última visita reciente" },
];

export const CLIENT_VISIT_FILTERS = [
	{ value: "todas", label: "Todas las visitas" },
	{ value: "mes", label: "Última visita: hace un mes" },
	{ value: "anio", label: "Última visita: hace un año" },
	{ value: "mas_de_un_anio", label: "Última visita: + de un año" },
];

export const DEFAULT_LOCALE = "es-AR";

export const EMPTY_STATES = {
	clientes: { icon: "👤", text: "Sin clientes" },
	ordenes: { icon: "📋", text: "Sin órdenes" },
	servicios: { icon: "🧼", text: "Sin servicios" },
};