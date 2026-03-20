import { useState, useEffect } from "react";
import api from "../../../api/api";
import { Icon } from "../../Icon/Icon";
import { DeleteClientModal } from "../DeleteClientModal/DeleteClientModal";
import { initials } from "../../../utils/dateUtils";
import styles from "./ClientDetail.module.css";

export function ClientDetail({
	client,
	onBack,
	onDelete,
	onUpdate,
	onRefresh,
	showToast,
}) {
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({
		nombre: client.nombre || "",
		telefono: client.telefono || "",
		email: client.email || "",
	});

	const [showAddAuto, setShowAddAuto] = useState(false);
	const [autoForm, setAutoForm] = useState({
		marca: "",
		modelo: "",
		patente: "",
		color: "",
		year: "",
	});

	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [historialReal, setHistorialReal] = useState([]);
	const [loadingHist, setLoadingHist] = useState(true);

	const vehiculos = client.Autos || client.vehiculos || [];

	useEffect(() => {
		setForm({
			nombre: client.nombre || "",
			telefono: client.telefono || "",
			email: client.email || "",
		});
	}, [client]);

	useEffect(() => {
		let cancelled = false;
		setLoadingHist(true);

		api.get(`/clientes/${client.id}/historial`)
			.then((res) => {
				if (cancelled) return;
				const data = Array.isArray(res) ? res : (res.data ?? []);
				setHistorialReal(data);
			})
			.catch(console.error)
			.finally(() => { if (!cancelled) setLoadingHist(false); });

		return () => { cancelled = true; };
	}, [client.id]);

	const totalGastado = historialReal.reduce((s, h) => s + Number(h.precio || 0), 0);

	const ultimaVisita = historialReal[0]?.fecha_entrega
		? new Date(historialReal[0].fecha_entrega).toLocaleDateString("es-AR")
		: "—";

	const servicioFrec = (() => {
		const cnt = {};
		historialReal.forEach((h) => {
			if (!h.servicio_nombre) return;
			cnt[h.servicio_nombre] = (cnt[h.servicio_nombre] || 0) + 1;
		});
		return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
	})();

	// FIX: Sequelize devuelve createdAt (camelCase)
	const createdAt = client.createdAt || client.created_at;

	function closeAddAutoModal() {
		setShowAddAuto(false);
		setAutoForm({ marca: "", modelo: "", patente: "", color: "", year: "" });
	}

	async function saveEdit() {
		if (!form.nombre?.trim()) return;
		setSaving(true);
		try {
			await onUpdate(client.id, form);
			setEditing(false);
			showToast("Cliente actualizado", "success");
		} catch (e) {
			showToast(e.message || "Error al guardar", "error");
		} finally {
			setSaving(false);
		}
	}

	async function addVehiculo() {
		if (!autoForm.marca || !autoForm.modelo || !autoForm.patente) return;
		setSaving(true);
		try {
			await api.post("/autos", { ...autoForm, cliente_id: client.id });
			await onRefresh(client.id);
			closeAddAutoModal();
			showToast("Vehículo agregado", "success");
		} catch (e) {
			showToast(e.message || "Error al agregar vehículo", "error");
		} finally {
			setSaving(false);
		}
	}

	async function removeVehiculo(vid) {
		try {
			await api.delete(`/autos/${vid}`);
			await onRefresh(client.id);
			showToast("Vehículo eliminado", "success");
		} catch (e) {
			showToast(e.message || "Error al eliminar", "error");
		}
	}

	async function doDeleteClient() {
		if (!deleteId) return;
		setDeleting(true);
		try {
			await onDelete(deleteId);
			setDeleteId(null);
			showToast("Cliente eliminado", "success");
			onBack();
		} catch (e) {
			showToast(e.message || "Error al eliminar cliente", "error");
		} finally {
			setDeleting(false);
		}
	}

	return (
		<div className={styles.pageContent}>
			<div className={styles.header}>
				<button type="button" className={styles.btnGhostSm} onClick={onBack}>
					<Icon name="chevLeft" size={14} />
					Volver a clientes
				</button>

				<div className={styles.actions}>
					{editing ? (
						<>
							<button type="button" className={styles.btnGhost} onClick={() => setEditing(false)}>
								Cancelar
							</button>
							<button type="button" className={styles.btnPrimary} onClick={saveEdit} disabled={saving}>
								<Icon name="save" size={13} />
								{saving ? "Guardando…" : "Guardar"}
							</button>
						</>
					) : (
						<>
							<button type="button" className={styles.btnGhost} onClick={() => setEditing(true)}>
								<Icon name="edit" size={13} /> Editar
							</button>
							<button type="button" className={styles.btnDanger} onClick={() => setDeleteId(client.id)}>
								<Icon name="trash" size={13} /> Eliminar
							</button>
						</>
					)}
				</div>
			</div>

			<div className={styles.mainGrid}>
				{/* Card datos del cliente */}
				<div className={`${styles.card} ${styles.clientCard}`}>
					<div className={styles.identityCard}>
						<div className={styles.avatar}>{initials(client.nombre)}</div>

						{editing ? (
							<input
								className={`${styles.input} ${styles.avatarInput}`}
								value={form.nombre}
								onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
							/>
						) : (
							<div className={styles.clientName}>{client.nombre}</div>
						)}

						{/* FIX: usar createdAt (camelCase) con fallback a created_at */}
						<div className={styles.clientSince}>
							CLIENTE DESDE{" "}
							{createdAt
								? new Date(createdAt).toLocaleDateString("es-AR", {
									day: "2-digit",
									month: "long",
									year: "numeric",
								})
								: "—"}
						</div>
					</div>

					<div className={styles.contactFields}>
						{[
							{ icon: "phone", label: "Teléfono", key: "telefono", val: client.telefono },
							{ icon: "mail", label: "Email", key: "email", val: client.email },
						].map((f) => (
							<div key={f.key} className={styles.contactField}>
								<div className={styles.fieldIcon}>
									<Icon name={f.icon} size={14} color="var(--muted2)" />
								</div>
								<div className={styles.fieldContent}>
									<div className={styles.fieldLabel}>{f.label.toUpperCase()}</div>
									{editing ? (
										<input
											className={`${styles.input} ${styles.fieldInput}`}
											value={form[f.key]}
											onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
										/>
									) : (
										<div className={styles.fieldValue}>{f.val || "—"}</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Card vehículos */}
				<div className={`${styles.card} ${styles.vehiclesCard}`}>
					<div className={styles.vehiclesHeader}>
						<div className={styles.sectionTitle}>Vehículos</div>
						<button type="button" className={styles.btnGhostSm} onClick={() => setShowAddAuto(true)}>
							<Icon name="plus" size={13} /> Agregar
						</button>
					</div>

					<div className={styles.scrollArea}>
						{vehiculos.length === 0 ? (
							<div className={`${styles.emptyState} ${styles.emptyStateContainer}`}>
								<div className={styles.emptyIcon}>🚗</div>
								<div className={styles.emptyText}>Sin vehículos registrados</div>
							</div>
						) : (
							<div className={styles.vehiclesGrid}>
								{vehiculos.map((v) => (
									<div key={v.id} className={styles.vehicleCard}>
										<button
											type="button"
											onClick={() => removeVehiculo(v.id)}
											className={styles.vehicleRemoveBtn}
										>
											<Icon name="x" size={13} />
										</button>
										<div className={styles.vehicleIcon}>🚗</div>
										<div className={styles.vehicleTitle}>{v.marca} {v.modelo}</div>
										<div className={styles.vehiclePlate}>{v.patente}</div>
										<div className={styles.vehicleBadges}>
											{v.color && <span className={styles.badgeMuted}>{v.color}</span>}
											{v.year && <span className={styles.badgeMuted}>{v.year}</span>}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Card estadísticas */}
				<div className={`${styles.card} ${styles.statsPanel}`}>
					<div className={styles.statsCard}>ESTADÍSTICAS</div>
					<div className={styles.scrollArea}>
						{[
							{ l: "Total gastado", v: `$${totalGastado.toLocaleString("es-AR")}`, c: "var(--cyan)" },
							{ l: "Visitas totales", v: historialReal.length, c: "var(--text)" },
							{ l: "Última visita", v: ultimaVisita, c: "var(--muted2)" },
							{ l: "Servicio frecuente", v: servicioFrec, c: "var(--orange)" },
							{ l: "Vehículos", v: vehiculos.length, c: "var(--text)" },
						].map((r) => (
							<div key={r.l} className={styles.statItem}>
								<span className={styles.statLabel}>{r.l}</span>
								<span className={styles.statValue} style={{ color: r.c }}>{r.v}</span>
							</div>
						))}
					</div>
				</div>

				{/* Card historial */}
				<div className={`${styles.card} ${styles.historyCard}`}>
					<div className={`${styles.sectionTitle} ${styles.historyHeader}`}>
						Historial de servicios
						<span className={`${styles.badge} ${styles.historyBadge}`}>
							{historialReal.length}
						</span>
					</div>

					{loadingHist ? (
						<div className={`${styles.emptyState} ${styles.emptyStateContainer}`}>
							<div className={styles.emptyIcon}>⏳</div>
							<div className={styles.emptyText}>Cargando historial…</div>
						</div>
					) : historialReal.length === 0 ? (
						<div className={`${styles.emptyState} ${styles.emptyStateContainer}`}>
							<div className={styles.emptyIcon}>📋</div>
							<div className={styles.emptyText}>Sin servicios registrados</div>
						</div>
					) : (
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Fecha</th>
									<th>Servicio</th>
									<th>Vehículo</th>
									<th>Monto</th>
								</tr>
							</thead>
							<tbody>
								{historialReal.map((h) => (
									<tr key={h.id}>
										<td className={styles.tableCellDate}>
											{new Date(h.fecha_entrega).toLocaleDateString("es-AR")}
										</td>
										<td className={styles.tableCellAutoPrimary}>{h.servicio_nombre}</td>
										<td className={styles.tableCellAutoSecondary}>
											{[h.auto_marca, h.auto_modelo, h.auto_patente].filter(Boolean).join(" ") || "—"}
										</td>
										<td className={styles.tableCellAmount}>
											${Number(h.precio || 0).toLocaleString("es-AR")}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>

			{/* Modal agregar vehículo */}
			{showAddAuto && (
				<div className={styles.modalOverlay} onClick={closeAddAutoModal}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<div className={styles.modalTitle}>Nuevo vehículo</div>
							<button type="button" className={styles.modalCloseBtn} onClick={closeAddAutoModal}>
								<Icon name="x" size={14} />
							</button>
						</div>

						<div className={styles.addVehicleGrid}>
							{[
								{ k: "marca", ph: "Toyota" },
								{ k: "modelo", ph: "Corolla" },
								{ k: "patente", ph: "ABC 123" },
								{ k: "color", ph: "Blanco" },
								{ k: "year", ph: "2022" },
							].map((f) => (
								<div key={f.k} className={styles.inputGroup}>
									<div className={styles.inputLabel}>
										{f.k.charAt(0).toUpperCase() + f.k.slice(1)}
									</div>
									<input
										className={styles.input}
										placeholder={f.ph}
										value={autoForm[f.k]}
										onChange={(e) => setAutoForm((p) => ({ ...p, [f.k]: e.target.value }))}
									/>
								</div>
							))}
						</div>

						<div className={styles.addVehicleActions}>
							<button type="button" className={styles.btnGhostSm} onClick={closeAddAutoModal}>
								Cancelar
							</button>
							<button type="button" className={styles.btnPrimarySm} onClick={addVehiculo} disabled={saving}>
								{saving ? "Agregando…" : "Agregar vehículo"}
							</button>
						</div>
					</div>
				</div>
			)}

			<DeleteClientModal
				deleteId={deleteId}
				setDeleteId={setDeleteId}
				doDelete={doDeleteClient}
				deleting={deleting}
			/>
		</div>
	);
}