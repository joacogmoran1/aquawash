import { useState, useEffect, useMemo, useCallback } from "react";

// Api
import api from "../../api/api";

// Section
import { ClientsContentSection } from "../../sections/client/ClientsContentSection";
import { ClientsModalsSection } from "../../sections/client/ClientsModalsSection";

// Components
import { ClientDetail } from "../../components/client/ClientDetail/ClientDetail";
import { PageLoading } from "../../components/PageLoading/PageLoading";

// Utils
import { getLastVisitGroup } from "../../utils/clients/clientsHelpers";

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

	const loadClients = useCallback(async (q, page) => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (q) params.set("search", q);
			params.set("page", String(page));
			params.set("limit", String(PAGE_SIZE));

			const res = await api.get(`/clientes?${params.toString()}`);

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

	async function handleUpdate(id, patch) {
		const updated = await api.put(`/clientes/${id}`, patch);
		setDetailClient((prev) => ({ ...prev, ...updated }));
		setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
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

	useEffect(() => {
		setCurrentPage(1);
	}, [search]);

	useEffect(() => {
		loadClients(search, currentPage);
	}, [search, currentPage, loadClients]);

	useEffect(() => {
		if (!selectedId) {
			setDetailClient(null);
			return;
		}
		api.get(`/clientes/${selectedId}`)
			.then(setDetailClient)
			.catch(console.error);
	}, [selectedId]);

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

	if (loading) return <PageLoading />;
	return (
		<>
			<ClientsContentSection
				search={search}
				setSearch={setSearch}
				sortBy={sortBy}
				setSortBy={setSortBy}
				lastVisitFilter={lastVisitFilter}
				setLastVisitFilter={setLastVisitFilter}
				processedClients={processedClients}
				totalClients={pagination.total}
				onNewClient={() => setShowModal(true)}
				setSelectedId={setSelectedId}
				requestDelete={requestDelete}
				pagination={pagination}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>

			<ClientsModalsSection
				showModal={showModal}
				setShowModal={setShowModal}
				form={form}
				setForm={setForm}
				addClient={addClient}
				saving={saving}
				deleteId={deleteId}
				setDeleteId={setDeleteId}
				doDelete={doDelete}
			/>
		</>
	);
}