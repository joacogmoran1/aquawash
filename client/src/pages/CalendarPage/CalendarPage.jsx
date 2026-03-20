import { useState, useEffect, useMemo } from "react";

// Api
import api from "../../api/api";

// Components
import { CalendarHeader } from "../../components/calendar/CalendarHeader/CalendarHeader.jsx";
import { CalendarGrid } from "../../components/calendar/CalendarGrid/CalendarGrid.jsx";
import { AppointmentList } from "../../components/calendar/AppointmentList/AppointmentList.jsx";
import { StatusLegend } from "../../components/calendar/StatusLegend/StatusLegend.jsx";
import { NewAppointmentModal } from "../../components/calendar/NewAppointmentModal/NewAppointmentModal.jsx";
import { PageLoading } from "../../components/PageLoading/PageLoading.jsx";


// Utils
import { getDaysInMonth, dateKey } from "../../utils/dateUtils";
import { MONTHS, WEEKDAYS } from "../../utils/constants";
import { esPasado, diaEsPasado } from "../../utils/calendarHelpers";

// Styles
import styles from "../../styles/calendar/CalendarPage.module.css";

export function CalendarPage({ showToast }) {
	const today = new Date();

	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());
	const [selected, setSelected] = useState(dateKey(today));
	const [turnos, setTurnos] = useState({});
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [clientes, setClientes] = useState([]);
	const [servicios, setServicios] = useState([]);
	const [clienteSearch, setClienteSearch] = useState("");

	const [newAppt, setNewAppt] = useState({
		cliente_id: "",
		auto_id: "",
		servicio_id: "",
		hora: "09:00",
	});

	const clienteSeleccionado = clientes.find(
		(c) => String(c.id) === String(newAppt.cliente_id)
	);

	const days = getDaysInMonth(year, month);
	const autosDelCliente = clienteSeleccionado?.Autos || [];
	const turnoEsPasado = esPasado(selected, newAppt.hora);
	const selectedEsPasado = diaEsPasado(selected);

	const selTurnos = turnos[selected] || [];
	const [, selM, selD] = selected.split("-").map(Number);

	const confirmDisabled =
		saving ||
		!newAppt.cliente_id ||
		!newAppt.auto_id ||
		!newAppt.servicio_id ||
		turnoEsPasado;

	function prevMonth() {
		if (month === 0) {
			setMonth(11);
			setYear((prev) => prev - 1);
		} else {
			setMonth((prev) => prev - 1);
		}
	}

	function nextMonth() {
		if (month === 11) {
			setMonth(0);
			setYear((prev) => prev + 1);
		} else {
			setMonth((prev) => prev + 1);
		}
	}

	function clearClienteSeleccionado() {
		setNewAppt((prev) => ({
			...prev,
			cliente_id: "",
			auto_id: "",
		}));
		setClienteSearch("");
	}

	function openModal() {
		const hoy = dateKey(new Date());

		if (selected === hoy) {
			const now = new Date();
			const proximaHora =
				now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();

			const horaDefault =
				proximaHora < 24
					? `${String(proximaHora).padStart(2, "0")}:00`
					: "23:59";

			setNewAppt({
				cliente_id: "",
				auto_id: "",
				servicio_id: "",
				hora: horaDefault,
			});
		} else {
			setNewAppt({
				cliente_id: "",
				auto_id: "",
				servicio_id: "",
				hora: "09:00",
			});
		}

		setClienteSearch("");
		setShowModal(true);
	}

	const clientesFiltrados = useMemo(() => {
		const q = clienteSearch.trim().toLowerCase();

		if (!q) return clientes.slice(0, 8);

		return clientes
			.filter((c) => {
				const nombre = c.nombre?.toLowerCase() || "";
				const telefono = c.telefono?.toLowerCase() || "";
				const email = c.email?.toLowerCase() || "";
				const autosTexto = (c.Autos || [])
					.map((a) =>
						`${a.marca || ""} ${a.modelo || ""} ${a.patente || ""}`.toLowerCase()
					)
					.join(" ");

				return (
					nombre.includes(q) ||
					telefono.includes(q) ||
					email.includes(q) ||
					autosTexto.includes(q)
				);
			})
			.slice(0, 8);
	}, [clientes, clienteSearch]);

	function selectCliente(cliente) {
		setNewAppt((prev) => ({
			...prev,
			cliente_id: cliente.id,
			auto_id: "",
		}));
		setClienteSearch(cliente.nombre);
	}

	async function addAppt() {
		if (!newAppt.cliente_id || !newAppt.auto_id || !newAppt.servicio_id) return;

		if (esPasado(selected, newAppt.hora)) {
			showToast?.("No podés agendar un turno en el pasado.", "error");
			return;
		}

		setSaving(true);

		try {
			const created = await api.post("/turnos", {
				cliente_id: newAppt.cliente_id,
				auto_id: newAppt.auto_id,
				servicio_id: newAppt.servicio_id,
				fecha: selected,
				hora: newAppt.hora,
				estado: "reservado",
			});

			setTurnos((prev) => ({
				...prev,
				[selected]: [...(prev[selected] || []), created],
			}));

			setNewAppt({
				cliente_id: "",
				auto_id: "",
				servicio_id: "",
				hora: "09:00",
			});

			setClienteSearch("");
			setShowModal(false);
			showToast?.("Turno agendado correctamente", "success");
		} catch (e) {
			showToast?.(e.message || "Error al agendar turno", "error");
		} finally {
			setSaving(false);
		}
	}

	async function deleteAppt(turnoId) {
		try {
			await api.delete(`/turnos/${turnoId}`);

			setTurnos((prev) => ({
				...prev,
				[selected]: (prev[selected] || []).filter((t) => t.id !== turnoId),
			}));

			showToast?.("Turno cancelado", "success");
		} catch (e) {
			showToast?.(e.message || "Error al cancelar turno", "error");
		}
	}

	// FIX #17 + #18: cleanup + showToast ya estable gracias a useCallback en App.jsx
	useEffect(() => {
		let cancelled = false;
		setLoading(true);

		const desde = `${year}-${String(month + 1).padStart(2, "0")}-01`;
		const lastDay = new Date(year, month + 1, 0).getDate();
		const hasta = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

		api.get(`/turnos?desde=${desde}&hasta=${hasta}`)
			.then((data) => {
				if (cancelled) return;
				const grouped = {};
				data.forEach((t) => {
					if (!grouped[t.fecha]) grouped[t.fecha] = [];
					grouped[t.fecha].push(t);
				});
				setTurnos(grouped);
			})
			.catch((err) => { if (!cancelled) showToast?.("Error al cargar turnos", "error"); console.error(err); })
			.finally(() => { if (!cancelled) setLoading(false); });

		return () => { cancelled = true; };
	}, [year, month, showToast]); // showToast ahora es estable → no re-ejecuta

	useEffect(() => {
		let cancelled = false;

		Promise.all([api.get("/clientes"), api.get("/servicios")])
			.then(([clientesRes, s]) => {
				if (cancelled) return;
				// clientesRes puede ser array (legacy) o { data: [] }
				const c = Array.isArray(clientesRes) ? clientesRes : (clientesRes.data ?? []);
				setClientes(c);
				setServicios(s);
			})
			.catch((err) => {
				if (!cancelled) {
					console.error(err);
					showToast?.("Error al cargar datos", "error");
				}
			});

		return () => { cancelled = true; };
	}, [showToast]);

	if (loading) {
		return <PageLoading />;
	}

	return (
		<div className={styles.pageContent}>
			<div className={styles.calendarGrid}>
				<div className={styles.card}>
					<CalendarHeader
						month={month}
						year={year}
						MONTHS={MONTHS}
						onPrevMonth={prevMonth}
						onNextMonth={nextMonth}
					/>

					<CalendarGrid
						days={days}
						turnos={turnos}
						selected={selected}
						today={today}
						setSelected={setSelected}
						diaEsPasado={diaEsPasado}
						WEEKDAYS={WEEKDAYS}
					/>
				</div>

				<div className={styles.sideColumn}>
					<AppointmentList
						loading={loading}
						selTurnos={selTurnos}
						selD={selD}
						selM={selM}
						MONTHS={MONTHS}
						selectedEsPasado={selectedEsPasado}
						openModal={openModal}
						deleteAppt={deleteAppt}
					/>

					<StatusLegend />
				</div>
			</div>

			<NewAppointmentModal
				showModal={showModal}
				setShowModal={setShowModal}
				selD={selD}
				selM={selM}
				newAppt={newAppt}
				setNewAppt={setNewAppt}
				turnoEsPasado={turnoEsPasado}
				clienteSeleccionado={clienteSeleccionado}
				clearClienteSeleccionado={clearClienteSeleccionado}
				clienteSearch={clienteSearch}
				setClienteSearch={setClienteSearch}
				clientesFiltrados={clientesFiltrados}
				selectCliente={selectCliente}
				autosDelCliente={autosDelCliente}
				servicios={servicios}
				addAppt={addAppt}
				confirmDisabled={confirmDisabled}
				saving={saving}
			/>
		</div>
	);
}