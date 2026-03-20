import { useState, useEffect, useMemo, useCallback } from "react";

// Api
import api from "../../api/api";

// Components
import { ClientDetail } from "../../components/client/ClientDetail/ClientDetail";
import { ClientsToolbar } from "../../components/client/ClientsToolbar/ClientsToolbar";
import { ClientsTable } from "../../components/client/ClientsTable/ClientsTable";
import { ClientsState } from "../../components/client/ClientsState/ClientsState";
import { NewClientModal } from "../../components/client/NewClientModal/NewClientModal";
import { DeleteClientModal } from "../../components/client/DeleteClientModal/DeleteClientModal";

// Utils
import { getLastVisitGroup } from "../../utils/clientsHelpers";

// Style
import layoutStyles from "../../styles/clients/ClientsPageLayout.module.css";
import shared from "../../styles/clients/ClientsShared.module.css";

const PAGE_SIZE = 50;


export function ClientsPage({ showToast }) {
	const [clients, setClients] = useState([]);
	const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const [detailClient, setDetailClient] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [form, setForm] = useState({ nombre: "", telefono: "", email: "" });
	const [saving, setSaving] = useState(false);
	const [sortBy, setSortBy] = useState("default");
	const [lastVisitFilter, setLastVisitFilter] = useState("todas");

	// Resetear a página 1 cuando cambia el search
	useEffect(() => {
		setCurrentPage(1);
	}, [search]);

	const loadClients = useCallback(async (q, page) => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (q) params.set("search", q);
			params.set("page", String(page));
			params.set("limit", String(PAGE_SIZE));

			// La API ahora retorna { data: [], pagination: { page, limit, total, totalPages } }
			const res = await api.get(`/clientes?${params.toString()}`);

			// Compatibilidad: si el backend todavía retorna array plano (durante transición)
			if (Array.isArray(res)) {
				setClients(res);
				setPagination({ page: 1, total: res.length, totalPages: 1 });
			} else {
				setClients(res.data ?? []);
				setPagination(res.pagination ?? { page: 1, total: 0, totalPages: 1 });
			}
		} catch (e) {
			showToast?.(e.message || "Error al cargar clientes", "error");
		} finally {
			setLoading(false);
		}
	}, [showToast]);

	useEffect(() => {
		loadClients(search, currentPage);
	}, [search, currentPage, loadClients]);

	// Cargar detalle al seleccionar un cliente
	useEffect(() => {
		if (!selectedId) {
			setDetailClient(null);
			return;
		}
		api.get(`/clientes/${selectedId}`)
			.then(setDetailClient)
			.catch(console.error);
	}, [selectedId]);

	async function handleUpdate(id, patch) {
		const updated = await api.put(`/clientes/${id}`, patch);
		setDetailClient((prev) => ({ ...prev, ...updated }));
		setClients((prev) =>
			prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
		);
	}

	async function handleRefresh(id) {
		const data = await api.get(`/clientes/${id}`);
		setDetailClient(data);
	}

	function requestDelete(id) {
		setDeleteId(id);
	}

	async function deleteClient(id) {
		await api.delete(`/clientes/${id}`);
		setClients((prev) => prev.filter((c) => c.id !== id));
		setDeleteId(null);
		if (selectedId === id) {
			setSelectedId(null);
			setDetailClient(null);
		}
	}

	async function doDelete() {
		if (!deleteId) return;
		try {
			await deleteClient(deleteId);
			showToast("Cliente eliminado", "success");
		} catch (e) {
			showToast(e.message || "Error al eliminar", "error");
			setDeleteId(null);
		}
	}

	async function addClient() {
		if (!form.nombre) return;
		setSaving(true);
		try {
			await api.post("/clientes", form);
			// Recargar la primera página para que aparezca el nuevo cliente
			setCurrentPage(1);
			setSearch("");
			await loadClients("", 1);
			setForm({ nombre: "", telefono: "", email: "" });
			setShowModal(false);
			showToast("Cliente creado exitosamente", "success");
		} catch (e) {
			showToast(e.message || "Error al crear cliente", "error");
		} finally {
			setSaving(false);
		}
	}

	// Filtros y ordenamiento en el cliente (sobre los datos de la página actual)
	const processedClients = useMemo(() => {
		let result = [...clients];

		if (lastVisitFilter !== "todas") {
			result = result.filter(
				(c) => getLastVisitGroup(c.ultima_visita) === lastVisitFilter
			);
		}

		if (sortBy === "visitas_desc") {
			result.sort(
				(a, b) =>
					(Number(b.cantidad_visitas) || 0) -
					(Number(a.cantidad_visitas) || 0)
			);
		}

		if (sortBy === "ultima_visita_desc") {
			result.sort((a, b) => {
				const aTime = a.ultima_visita
					? new Date(a.ultima_visita).getTime()
					: 0;
				const bTime = b.ultima_visita
					? new Date(b.ultima_visita).getTime()
					: 0;
				return bTime - aTime;
			});
		}

		return result;
	}, [clients, sortBy, lastVisitFilter]);

	if (selectedId && detailClient) {
		return (
			<ClientDetail
				client={detailClient}
				onBack={() => setSelectedId(null)}
				onDelete={deleteClient}
				onUpdate={handleUpdate}
				onRefresh={handleRefresh}
				showToast={showToast}
			/>
		);
	}

	return (
		<div className={layoutStyles.pageContent}>
			<div className={shared.card}>
				<ClientsToolbar
					search={search}
					setSearch={setSearch}
					sortBy={sortBy}
					setSortBy={setSortBy}
					lastVisitFilter={lastVisitFilter}
					setLastVisitFilter={setLastVisitFilter}
					processedClients={processedClients}
					totalClients={pagination.total}
					onNewClient={() => setShowModal(true)}
				/>

				{loading ? (
					<ClientsState type="loading" />
				) : processedClients.length === 0 ? (
					<ClientsState type="empty" />
				) : (
					<ClientsTable
						processedClients={processedClients}
						setSelectedId={setSelectedId}
						handleDelete={requestDelete}
					/>
				)}

				{/* Paginación */}
				{!loading && pagination.totalPages > 1 && (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: 12,
							padding: "16px 0 4px",
							borderTop: "1px solid var(--border)",
							marginTop: 12,
						}}
					>
						<button
							className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage <= 1}
						>
							← Anterior
						</button>

						<span
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: 12,
								color: "var(--muted2)",
							}}
						>
							{currentPage} / {pagination.totalPages}
							{" "}·{" "}
							{pagination.total} clientes
						</span>

						<button
							className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
							onClick={() =>
								setCurrentPage((p) =>
									Math.min(pagination.totalPages, p + 1)
								)
							}
							disabled={currentPage >= pagination.totalPages}
						>
							Siguiente →
						</button>
					</div>
				)}
			</div>

			<NewClientModal
				showModal={showModal}
				setShowModal={setShowModal}
				form={form}
				setForm={setForm}
				addClient={addClient}
				saving={saving}
			/>

			<DeleteClientModal
				deleteId={deleteId}
				setDeleteId={setDeleteId}
				doDelete={doDelete}
			/>
		</div>
	);
}