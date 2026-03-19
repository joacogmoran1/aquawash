import { useState, useEffect, useMemo } from "react";

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

export function ClientsPage({ showToast }) {
	const [clients, setClients] = useState([]);
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

	useEffect(() => {
		loadClients(search);
	}, [search]);

	useEffect(() => {
		if (!selectedId) {
			setDetailClient(null);
			return;
		}

		api.get(`/clientes/${selectedId}`).then(setDetailClient).catch(console.error);
	}, [selectedId]);

	async function loadClients(q) {
		try {
			const params = q ? `?search=${encodeURIComponent(q)}` : "";
			const data = await api.get(`/clientes${params}`);
			setClients(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	async function handleUpdate(id, patch) {
		const updated = await api.put(`/clientes/${id}`, patch);
		setDetailClient((prev) => ({ ...prev, ...updated }));
		setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
	}

	async function handleRefresh(id) {
		const data = await api.get(`/clientes/${id}`);
		setDetailClient(data);
	}

	// Solo abre el modal en la lista
	function requestDelete(id) {
		setDeleteId(id);
	}

	// Elimina de verdad (para lista y detalle)
	async function deleteClient(id) {
		console.log(clients)

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
			const nc = await api.post("/clientes", form);
			setClients((prev) => [nc, ...prev]);
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
					(Number(b.cantidad_visitas) || 0) - (Number(a.cantidad_visitas) || 0)
			);
		}

		if (sortBy === "ultima_visita_desc") {
			result.sort((a, b) => {
				const aTime = a.ultima_visita ? new Date(a.ultima_visita).getTime() : 0;
				const bTime = b.ultima_visita ? new Date(b.ultima_visita).getTime() : 0;
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