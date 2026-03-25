import { useEffect, useMemo, useState } from "react";

// Api
import api from "../../api/api";

// Components
import { Icon } from "../../components/Icon/Icon";
import { BackBtn } from "../../components/BackBtn/BackBtn";
import { EstadoBadge } from "../../components/dashboard/EstadoBadage/EstadoBadage";
import { ConfirmModal } from "../../components/dashboard/ConfirmModal/ConfirmModal";
import { SectionCard } from "../../components/dashboard/SectionCard/SectionCard";
import { EmptyState } from "../../components/dashboard/EmptyState/EmptyState";
import { PageLoading } from "../../components/PageLoading/PageLoading";

// Utils
import {
	ORDER_STATES,
	ESTADO_FLOW,
	ESTADO_COLORS,
	FILTER_COLORS,
	MONTHS,
} from "../../utils/constants";
import { dateKey } from "../../utils/dateUtils";
import { fmtCurrency, fmtHour, getDurationMin } from "../../utils/dashboard/helpers";

// Style
import shared from "../../styles/dashboard/Shared.module.css";
import styles from "../../styles/dashboard/Ordenes.module.css";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getWeekOfMonth(date) {
	return Math.ceil(date.getDate() / 7);
}

function fmtDia(ts) {
	if (!ts) return "—";
	return new Date(ts).toLocaleDateString("es-AR", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
	});
}

function isToday(ts) {
	if (!ts) return false;
	const d = new Date(ts);
	const hoy = new Date();
	return (
		d.getFullYear() === hoy.getFullYear() &&
		d.getMonth() === hoy.getMonth() &&
		d.getDate() === hoy.getDate()
	);
}

function getHorasDisponibles(orders) {
	const set = new Set();
	orders.forEach((o) => {
		if (o.hora_llegada) set.add(new Date(o.hora_llegada).getHours());
	});
	return [...set].sort((a, b) => a - b);
}

const SELECT_STYLE = {
	background: "var(--card2)",
	border: "1px solid var(--border)",
	borderRadius: 8,
	padding: "6px 10px",
	color: "var(--text)",
	fontFamily: "var(--font-mono)",
	fontSize: 12,
	cursor: "pointer",
	outline: "none",
};

const TODAY = new Date();
const DEFAULT_MES = String(TODAY.getMonth());
const DEFAULT_SEMANA = String(getWeekOfMonth(TODAY));

// ── Carga con rango amplio (oculto al usuario) ────────────────────────────────
function getLoadRange() {
	const desde = new Date();
	desde.setMonth(desde.getMonth() - 2);
	const hasta = new Date();
	hasta.setDate(hasta.getDate() + 90);
	return { desde: dateKey(desde), hasta: dateKey(hasta) };
}

export function OrdenesDetail({ onBack }) {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("todas");
	const [search, setSearch] = useState("");
	const [confirm, setConfirm] = useState(null);
	const [cancelId, setCancelId] = useState(null);
	const [confirmLimpiar, setConfirmLimpiar] = useState(false);
	const [advancing, setAdvancing] = useState(null);
	const [cancelling, setCancelling] = useState(null);
	const [limpiando, setLimpiando] = useState(false);

	// Filtros — por defecto: HOY activo, mes y semana seteados a la semana actual
	const [filterHoy, setFilterHoy] = useState(true);
	const [filterMes, setFilterMes] = useState(DEFAULT_MES);
	const [filterSemana, setFilterSemana] = useState(DEFAULT_SEMANA);
	const [filterHora, setFilterHora] = useState("");

	async function load() {
		setLoading(true);
		try {
			const { desde, hasta } = getLoadRange();
			const params = new URLSearchParams({ desde, hasta });
			const data = await api.get(`/ordenes?${params.toString()}`);
			setOrders(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { load(); }, []);

	// Al cambiar mes, resetear semana y hora
	useEffect(() => {
		setFilterSemana("");
		setFilterHora("");
	}, [filterMes]);

	// Al activar HOY, sincronizar mes y semana con hoy
	useEffect(() => {
		if (filterHoy) {
			setFilterMes(DEFAULT_MES);
			setFilterSemana(DEFAULT_SEMANA);
			setFilterHora("");
		}
	}, [filterHoy]);

	const counts = useMemo(() => {
		const base = { todas: orders.length };
		ORDER_STATES.forEach((s) => {
			base[s.key] = orders.filter((o) => o.estado === s.key).length;
		});
		return base;
	}, [orders]);

	const horasDisponibles = useMemo(() => getHorasDisponibles(orders), [orders]);

	const semanasDisponibles = useMemo(() => {
		if (!filterMes) return [];
		const set = new Set();
		orders.forEach((o) => {
			if (!o.hora_llegada) return;
			const d = new Date(o.hora_llegada);
			if (d.getMonth() === Number(filterMes)) set.add(getWeekOfMonth(d));
		});
		return [...set].sort((a, b) => a - b);
	}, [orders, filterMes]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return orders.filter((o) => {
			// Estado
			if (filter !== "todas" && o.estado !== filter) return false;

			// Texto
			if (q) {
				const match = [o.Cliente?.nombre, o.Auto?.patente, o.Auto?.marca, o.Auto?.modelo]
					.filter(Boolean)
					.some((f) => String(f).toLowerCase().includes(q));
				if (!match) return false;
			}

			// HOY tiene prioridad sobre mes/semana
			if (filterHoy) {
				if (!isToday(o.hora_llegada)) return false;
			} else {
				// Mes
				if (filterMes !== "" && o.hora_llegada) {
					if (new Date(o.hora_llegada).getMonth() !== Number(filterMes)) return false;
				}
				// Semana
				if (filterSemana !== "" && o.hora_llegada) {
					if (getWeekOfMonth(new Date(o.hora_llegada)) !== Number(filterSemana)) return false;
				}
			}

			// Hora (aplica siempre)
			if (filterHora !== "" && o.hora_llegada) {
				if (new Date(o.hora_llegada).getHours() !== Number(filterHora)) return false;
			}

			return true;
		});
	}, [orders, filter, search, filterHoy, filterMes, filterSemana, filterHora]);

	const hayFinalizadas = orders.some((o) =>
		["entregado", "cancelado"].includes(o.estado)
	);

	function handleActivarHoy() {
		setFilterHoy(true);
		// mes y semana se sincronizan via useEffect
	}

	function handleDesactivarHoy() {
		setFilterHoy(false);
	}

	async function advanceEstado(id) {
		setAdvancing(id);
		try {
			const updated = await api.post(`/ordenes/${id}/avanzar`);
			setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
		} catch (e) { console.error(e); }
		finally { setAdvancing(null); setConfirm(null); }
	}

	async function cancelarOrden(id) {
		setCancelling(id);
		try {
			const updated = await api.post(`/ordenes/${id}/cancelar`);
			setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
		} catch (e) { console.error(e); }
		finally { setCancelling(null); setCancelId(null); }
	}

	async function limpiarFinalizadas() {
		setLimpiando(true);
		try {
			await api.delete("/ordenes/finalizadas");
			setOrders((prev) =>
				prev.filter((o) => !["entregado", "cancelado"].includes(o.estado))
			);
			setConfirmLimpiar(false);
		} catch (e) { console.error(e); }
		finally { setLimpiando(false); }
	}

	if (loading) {
		return (
			<div className={styles.pageContent}>
				<BackBtn onClick={onBack} />
				<PageLoading />
			</div>
		);
	}

	return (
		<div className={styles.pageContent}>
			<BackBtn onClick={onBack} />

			{/* Filtros de fecha */}
			<div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
				<span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: 2 }}>
					VER
				</span>

				{/* Botón HOY */}
				<button
					className="btn btn-sm"
					onClick={filterHoy ? handleDesactivarHoy : handleActivarHoy}
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 11,
						borderColor: filterHoy ? "var(--cyan)" : "var(--border)",
						background: filterHoy ? "var(--cyan-glow)" : "transparent",
						color: filterHoy ? "var(--cyan)" : "var(--muted2)",
						fontWeight: filterHoy ? 700 : 400,
					}}
				>
					HOY
				</button>

				{/* Botón VER TODAS */}
				<button
					className="btn btn-sm"
					onClick={() => {
						setFilterHoy(false);
						setFilterMes("");
						setFilterSemana("");
						setFilterHora("");
					}}
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 11,
						borderColor: !filterHoy && filterMes === "" && filterSemana === "" && filterHora === ""
							? "var(--cyan)"
							: "var(--border)",
						background: !filterHoy && filterMes === "" && filterSemana === "" && filterHora === ""
							? "var(--cyan-glow)"
							: "transparent",
						color: !filterHoy && filterMes === "" && filterSemana === "" && filterHora === ""
							? "var(--cyan)"
							: "var(--muted2)",
						fontWeight: !filterHoy && filterMes === "" && filterSemana === "" && filterHora === "" ? 700 : 400,
					}}
				>
					TODAS
				</button>

				{/* Mes */}
				<select
					value={filterMes}
					onChange={(e) => { setFilterHoy(false); setFilterMes(e.target.value); }}
					style={{
						...SELECT_STYLE,
						borderColor: !filterHoy && filterMes !== "" ? "var(--cyan)" : "var(--border)",
						color: !filterHoy && filterMes !== "" ? "var(--cyan)" : "var(--text)",
					}}
				>
					<option value="">Todos los meses</option>
					{MONTHS.map((m) => (
						<option key={m.value} value={String(m.value)}>{m.label}</option>
					))}
				</select>

				{/* Semana — solo si hay mes seleccionado */}
				{filterMes !== "" && (
					<select
						value={filterSemana}
						onChange={(e) => { setFilterHoy(false); setFilterSemana(e.target.value); }}
						style={{
							...SELECT_STYLE,
							borderColor: !filterHoy && filterSemana !== "" ? "var(--cyan)" : "var(--border)",
							color: !filterHoy && filterSemana !== "" ? "var(--cyan)" : "var(--text)",
						}}
					>
						<option value="">Todas las semanas</option>
						{semanasDisponibles.map((s) => (
							<option key={s} value={String(s)}>Semana {s}</option>
						))}
					</select>
				)}

				{/* Hora */}
				<select
					value={filterHora}
					onChange={(e) => setFilterHora(e.target.value)}
					style={{
						...SELECT_STYLE,
						borderColor: filterHora !== "" ? "var(--cyan)" : "var(--border)",
						color: filterHora !== "" ? "var(--cyan)" : "var(--text)",
					}}
				>
					<option value="">Todas las horas</option>
					{horasDisponibles.map((h) => (
						<option key={h} value={String(h)}>
							{String(h).padStart(2, "0")}:00
						</option>
					))}
				</select>
			</div>

			<SectionCard>
				<div className={shared.sectionHeader}>
					<div className={styles.filterButtonsWrap}>
						<button
							type="button"
							onClick={() => setFilter("todas")}
							className={styles.filterButton}
							style={{
								borderColor: filter === "todas" ? FILTER_COLORS.todas : "var(--border)",
								color: filter === "todas" ? FILTER_COLORS.todas : "var(--muted2)",
							}}
						>
							TODAS {counts.todas > 0 && `(${counts.todas})`}
						</button>

						{ORDER_STATES.map((e) => (
							<button
								type="button"
								key={e.key}
								onClick={() => setFilter(e.key)}
								className={styles.filterButton}
								style={{
									borderColor: filter === e.key ? FILTER_COLORS[e.key] : "var(--border)",
									color: filter === e.key ? FILTER_COLORS[e.key] : "var(--muted2)",
								}}
							>
								{e.label.toUpperCase()} {counts[e.key] > 0 && `(${counts[e.key]})`}
							</button>
						))}
					</div>

					<div className={styles.searchActions}>
						<div className={styles.searchBar}>
							<Icon name="search" size={13} color="var(--muted)" />
							<input
								placeholder="Cliente, auto, patente…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{hayFinalizadas && (
							<button
								type="button"
								className={styles.iconDangerBtn}
								onClick={() => setConfirmLimpiar(true)}
								title="Limpiar finalizadas"
							>
								<Icon name="trash" size={12} />
							</button>
						)}
					</div>
				</div>

				{/* Resumen */}
				<div style={{
					marginBottom: 10,
					fontFamily: "var(--font-mono)",
					fontSize: 10,
					color: "var(--muted2)",
					letterSpacing: 1,
				}}>
					{filtered.length} orden{filtered.length !== 1 ? "es" : ""} ·{" "}
					{filterHoy
						? `hoy ${TODAY.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
						: filterMes !== ""
							? `${MONTHS[Number(filterMes)]?.label}${filterSemana !== "" ? ` · Semana ${filterSemana}` : ""}`
							: "todos los períodos"
					}
				</div>

				{filtered.length === 0 ? (
					<EmptyState icon="🔍" text="Sin resultados" />
				) : (
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Cliente / Auto</th>
								<th>Día</th>
								<th>Servicio</th>
								<th>Entrada</th>
								<th>Salida</th>
								<th>Duración</th>
								<th>Monto</th>
								<th>Estado</th>
								<th>Acción</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((o) => {
								const flow = ESTADO_FLOW[o.estado];
								const dur = getDurationMin(o);
								const canCancel = o.estado === "agendado";

								return (
									<tr
										key={o.id}
										className={shared.orderRow}
										style={{
											borderLeft: `3px solid ${ESTADO_COLORS[o.estado] || "var(--border)"}22`,
										}}
									>
										<td>
											<div className={shared.clientPrimary}>
												{o.Cliente?.nombre || "—"}
											</div>
											<div className={shared.clientSecondary}>
												{o.Auto?.marca} {o.Auto?.modelo} · {o.Auto?.patente}
											</div>
										</td>

										<td>
											<div style={{
												fontFamily: "var(--font-mono)",
												fontSize: 11,
												color: "var(--text)",
												whiteSpace: "nowrap",
												textTransform: "capitalize",
											}}>
												{fmtDia(o.hora_llegada)}
											</div>
										</td>

										<td className={shared.serviceCell}>{o.servicio_tipo}</td>
										<td className={shared.timeCell}>{fmtHour(o.hora_llegada)}</td>
										<td className={shared.timeCell}>{fmtHour(o.hora_fin)}</td>
										<td>
											{dur != null
												? <span className={shared.durationCell}>{dur} min</span>
												: <span className={shared.durationCellMuted}>—</span>
											}
										</td>
										<td className={shared.moneyCell}>{fmtCurrency(o.precio)}</td>
										<td><EstadoBadge estado={o.estado} /></td>
										<td>
											<div className={styles.rowActions}>
												{flow ? (
													<button
														type="button"
														disabled={advancing === o.id}
														onClick={() => setConfirm({
															id: o.id,
															nextEstado: flow.next,
															label: flow.label,
															cliente: o.Cliente?.nombre || "",
														})}
														className={styles.actionButton}
														style={{
															borderColor: `${flow.color}55`,
															background: advancing === o.id ? "var(--border)" : `${flow.color}12`,
															color: advancing === o.id ? "var(--muted)" : flow.color,
														}}
													>
														{advancing === o.id ? "…" : <>{flow.icon} {flow.label}</>}
													</button>
												) : (
													<span className={styles.completedLabel}>
														{o.estado === "cancelado" ? "Cancelada" : "Completada"}
													</span>
												)}

												{canCancel && (
													<button
														type="button"
														disabled={cancelling === o.id}
														onClick={() => setCancelId(o.id)}
														className={styles.actionButton}
														style={{
															borderColor: "rgba(255,77,109,0.35)",
															background: cancelling === o.id ? "var(--border)" : "rgba(255,77,109,0.08)",
															color: cancelling === o.id ? "var(--muted)" : "var(--red)",
															fontSize: 11,
														}}
													>
														{cancelling === o.id ? "…" : "🚫 Cancelar"}
													</button>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</SectionCard>

			{/* Modales */}
			<ConfirmModal
				open={!!confirm}
				title="Confirmar cambio"
				onClose={() => setConfirm(null)}
				actions={
					<>
						<button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancelar</button>
						<button
							className="btn btn-primary"
							onClick={() => advanceEstado(confirm.id)}
							disabled={advancing === confirm?.id}
						>
							{advancing === confirm?.id ? "Procesando…" : "Confirmar"}
						</button>
					</>
				}
			>
				<p className={shared.modalText}>
					¿Pasás la orden de{" "}
					<strong className={shared.modalStrong}>{confirm?.cliente}</strong> al estado:
				</p>
				<div className={shared.modalBadgeWrap}>
					<EstadoBadge estado={confirm?.nextEstado} />
				</div>
			</ConfirmModal>

			<ConfirmModal
				open={!!cancelId}
				title="Cancelar orden"
				onClose={() => setCancelId(null)}
				maxWidth={380}
				actions={
					<>
						<button className="btn btn-ghost" onClick={() => setCancelId(null)}>Volver</button>
						<button
							className="btn btn-danger"
							onClick={() => cancelarOrden(cancelId)}
							disabled={cancelling === cancelId}
						>
							{cancelling === cancelId ? "Cancelando…" : "🚫 Confirmar cancelación"}
						</button>
					</>
				}
			>
				<p className={shared.modalText}>
					¿Estás seguro que querés cancelar esta orden? El turno asociado también será eliminado.
				</p>
			</ConfirmModal>

			<ConfirmModal
				open={confirmLimpiar}
				title="Limpiar órdenes finalizadas"
				onClose={() => setConfirmLimpiar(false)}
				maxWidth={400}
				actions={
					<>
						<button className="btn btn-ghost" onClick={() => setConfirmLimpiar(false)}>Cancelar</button>
						<button
							className="btn btn-danger"
							onClick={limpiarFinalizadas}
							disabled={limpiando}
						>
							{limpiando ? "Eliminando…" : "🗑 Confirmar limpieza"}
						</button>
					</>
				}
			>
				<p className={shared.modalText}>
					Esto eliminará permanentemente todas las órdenes con estado{" "}
					<strong className={shared.modalStrong}>entregado</strong> y{" "}
					<strong className={shared.modalStrong}>cancelado</strong> en el período seleccionado.
				</p>
			</ConfirmModal>
		</div>
	);
}