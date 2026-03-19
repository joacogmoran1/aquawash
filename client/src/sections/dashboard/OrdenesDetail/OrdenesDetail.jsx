import { useEffect, useMemo, useState } from "react";

// Api
import api from "../../../api/api";

// Components
import { Icon } from "../../../components/Icon/Icon";
import { BackBtn } from "../../../components/BackBtn/BackBtn";
import { EstadoBadge } from "../../../components/dashboard/EstadoBadage/EstadoBadage";
import { ConfirmModal } from "../../../components/dashboard/ConfirmModal/ConfirmModal";
import { SectionCard } from "../../../components/dashboard/SectionCard/SectionCard";
import { EmptyState } from "../../../components/dashboard/EmptyState/EmptyState";

// Utils
import {
	ORDER_STATES,
	ESTADO_FLOW,
	ESTADO_COLORS,
	FILTER_COLORS,
} from "../../../utils/constants";
import { dateKey } from "../../../utils/dateUtils";
import { fmtCurrency, fmtHour, getDurationMin } from "../../../utils/dashboard/helpers";

// Style
import shared from "../../../styles/dashboard/Shared.module.css";
import styles from "../../../styles/dashboard/Ordenes.module.css";

// Rango de fechas por defecto: últimos 30 días
function getDefaultDateRange() {
	const hasta = new Date();
	const desde = new Date();
	desde.setDate(desde.getDate() - 30);
	return {
		desde: dateKey(desde),
		hasta: dateKey(hasta),
	};
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

	// Filtro de fecha — por defecto últimos 30 días
	const [dateRange, setDateRange] = useState(getDefaultDateRange);

	async function load() {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (dateRange.desde) params.set("desde", dateRange.desde);
			if (dateRange.hasta) params.set("hasta", dateRange.hasta);

			const data = await api.get(`/ordenes?${params.toString()}`);
			setOrders(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRange]);

	const counts = useMemo(() => {
		const base = { todas: orders.length };
		ORDER_STATES.forEach((state) => {
			base[state.key] = orders.filter((o) => o.estado === state.key).length;
		});
		return base;
	}, [orders]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return orders.filter((o) => {
			const matchEstado = filter === "todas" || o.estado === filter;
			const matchSearch =
				!q ||
				[o.Cliente?.nombre, o.Auto?.patente, o.Auto?.marca, o.Auto?.modelo]
					.filter(Boolean)
					.some((f) => String(f).toLowerCase().includes(q));
			return matchEstado && matchSearch;
		});
	}, [orders, filter, search]);

	const hayFinalizadas = orders.some((o) =>
		["entregado", "cancelado"].includes(o.estado)
	);

	async function advanceEstado(id) {
		setAdvancing(id);
		try {
			const updated = await api.post(`/ordenes/${id}/avanzar`);
			setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
		} catch (e) {
			console.error(e);
		} finally {
			setAdvancing(null);
			setConfirm(null);
		}
	}

	async function cancelarOrden(id) {
		setCancelling(id);
		try {
			const updated = await api.post(`/ordenes/${id}/cancelar`);
			setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
		} catch (e) {
			console.error(e);
		} finally {
			setCancelling(null);
			setCancelId(null);
		}
	}

	async function limpiarFinalizadas() {
		setLimpiando(true);
		try {
			await api.delete("/ordenes/finalizadas");
			setOrders((prev) =>
				prev.filter((o) => !["entregado", "cancelado"].includes(o.estado))
			);
			setConfirmLimpiar(false);
		} catch (e) {
			console.error(e);
		} finally {
			setLimpiando(false);
		}
	}

	return (
		<div className={styles.pageContent}>
			<BackBtn onClick={onBack} />

			{/* Flujo de estados */}
			<div className={styles.flowLegend}>
				<span className={styles.flowLegendTitle}>FLUJO</span>
				{["agendado", "esperando", "lavando", "listo", "entregado"].map(
					(e, i, arr) => (
						<div key={e} className={styles.flowStep}>
							<EstadoBadge estado={e} />
							{i < arr.length - 1 && (
								<span className={styles.flowArrow}>→</span>
							)}
						</div>
					)
				)}
			</div>

			{/* Filtro de fecha */}
			<div
				style={{
					display: "flex",
					gap: 12,
					marginBottom: 16,
					alignItems: "center",
					flexWrap: "wrap",
				}}
			>
				<span
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 10,
						color: "var(--muted)",
						letterSpacing: 2,
					}}
				>
					PERÍODO
				</span>

				<input
					type="date"
					value={dateRange.desde}
					onChange={(e) =>
						setDateRange((prev) => ({ ...prev, desde: e.target.value }))
					}
					style={{
						background: "var(--card2)",
						border: "1px solid var(--border)",
						borderRadius: 8,
						padding: "6px 10px",
						color: "var(--text)",
						fontFamily: "var(--font-mono)",
						fontSize: 12,
					}}
				/>

				<span style={{ color: "var(--muted)", fontSize: 12 }}>→</span>

				<input
					type="date"
					value={dateRange.hasta}
					onChange={(e) =>
						setDateRange((prev) => ({ ...prev, hasta: e.target.value }))
					}
					style={{
						background: "var(--card2)",
						border: "1px solid var(--border)",
						borderRadius: 8,
						padding: "6px 10px",
						color: "var(--text)",
						fontFamily: "var(--font-mono)",
						fontSize: 12,
					}}
				/>

				<button
					className="btn btn-ghost btn-sm"
					onClick={() => setDateRange(getDefaultDateRange())}
					style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
				>
					Últimos 30 días
				</button>
			</div>

			<SectionCard>
				<div className={shared.sectionHeader}>
					<div className={styles.filterButtonsWrap}>
						<button
							type="button"
							onClick={() => setFilter("todas")}
							className={styles.filterButton}
							style={{
								borderColor:
									filter === "todas" ? FILTER_COLORS.todas : "var(--border)",
								color:
									filter === "todas" ? FILTER_COLORS.todas : "var(--muted2)",
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
									borderColor:
										filter === e.key
											? FILTER_COLORS[e.key]
											: "var(--border)",
									color:
										filter === e.key
											? FILTER_COLORS[e.key]
											: "var(--muted2)",
								}}
							>
								{e.label.toUpperCase()}{" "}
								{counts[e.key] > 0 && `(${counts[e.key]})`}
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

				{loading ? (
					<EmptyState icon="⏳" text="Cargando órdenes…" />
				) : filtered.length === 0 ? (
					<EmptyState icon="🔍" text="Sin resultados" />
				) : (
					<table className={shared.table}>
						<thead>
							<tr>
								<th>Cliente / Auto</th>
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
												{o.Auto?.marca} {o.Auto?.modelo} ·{" "}
												{o.Auto?.patente}
											</div>
										</td>
										<td className={shared.serviceCell}>
											{o.servicio_tipo}
										</td>
										<td className={shared.timeCell}>
											{fmtHour(o.hora_llegada)}
										</td>
										<td className={shared.timeCell}>
											{fmtHour(o.hora_fin)}
										</td>
										<td>
											{dur != null ? (
												<span className={shared.durationCell}>
													{dur} min
												</span>
											) : (
												<span className={shared.durationCellMuted}>
													—
												</span>
											)}
										</td>
										<td className={shared.moneyCell}>
											{fmtCurrency(o.precio)}
										</td>
										<td>
											<EstadoBadge estado={o.estado} />
										</td>
										<td>
											<div className={styles.rowActions}>
												{flow ? (
													<button
														type="button"
														disabled={advancing === o.id}
														onClick={() =>
															setConfirm({
																id: o.id,
																nextEstado: flow.next,
																label: flow.label,
																cliente: o.Cliente?.nombre || "",
															})
														}
														className={styles.actionButton}
														style={{
															borderColor: `${flow.color}55`,
															background:
																advancing === o.id
																	? "var(--border)"
																	: `${flow.color}12`,
															color:
																advancing === o.id
																	? "var(--muted)"
																	: flow.color,
														}}
													>
														{advancing === o.id ? (
															"…"
														) : (
															<>
																{flow.icon} {flow.label}
															</>
														)}
													</button>
												) : (
													<span className={styles.completedLabel}>
														{o.estado === "cancelado"
															? "Cancelada"
															: "Completada"}
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
															background:
																cancelling === o.id
																	? "var(--border)"
																	: "rgba(255,77,109,0.08)",
															color:
																cancelling === o.id
																	? "var(--muted)"
																	: "var(--red)",
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
						<button
							className="btn btn-ghost"
							onClick={() => setConfirm(null)}
						>
							Cancelar
						</button>
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
					<strong className={shared.modalStrong}>{confirm?.cliente}</strong>{" "}
					al estado:
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
						<button
							className="btn btn-ghost"
							onClick={() => setCancelId(null)}
						>
							Volver
						</button>
						<button
							className="btn btn-danger"
							onClick={() => cancelarOrden(cancelId)}
							disabled={cancelling === cancelId}
						>
							{cancelling === cancelId
								? "Cancelando…"
								: "🚫 Confirmar cancelación"}
						</button>
					</>
				}
			>
				<p className={shared.modalText}>
					¿Estás seguro que querés cancelar esta orden? El turno asociado
					también será eliminado.
				</p>
			</ConfirmModal>

			<ConfirmModal
				open={confirmLimpiar}
				title="Limpiar órdenes finalizadas"
				onClose={() => setConfirmLimpiar(false)}
				maxWidth={400}
				actions={
					<>
						<button
							className="btn btn-ghost"
							onClick={() => setConfirmLimpiar(false)}
						>
							Cancelar
						</button>
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
					<strong className={shared.modalStrong}>cancelado</strong> en el
					período seleccionado.
				</p>
			</ConfirmModal>
		</div>
	);
}