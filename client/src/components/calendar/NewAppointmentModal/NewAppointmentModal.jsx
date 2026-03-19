
// Utils
import { MONTHS } from "../../../utils/constants";

// Styles
import styles from "../../../styles/calendar/NewAppointmentModal.module.css";

export function NewAppointmentModal({
    showModal,
    setShowModal,
    selD,
    selM,
    newAppt,
    setNewAppt,
    turnoEsPasado,
    clienteSeleccionado,
    clearClienteSeleccionado,
    clienteSearch,
    setClienteSearch,
    clientesFiltrados,
    selectCliente,
    autosDelCliente,
    servicios,
    addAppt,
    confirmDisabled,
    saving,
}) {
    if (!showModal) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget) setShowModal(false);
            }}
        >
            <div className={styles.modal}>
                <div className={styles.modalTitle}>
                    Nuevo Turno — {selD} de {MONTHS[selM - 1]?.label}
                </div>

                <div className={styles.modalForm}>
                    <div className={styles.inputGroup}>
                        <div className={styles.inputLabel}>Hora</div>
                        <input
                            className={styles.input}
                            type="time"
                            value={newAppt.hora}
                            onChange={(e) =>
                                setNewAppt((p) => ({ ...p, hora: e.target.value }))
                            }
                        />
                        {turnoEsPasado && (
                            <div className={styles.pastTimeWarning}>
                                ⚠ Este horario ya pasó. Elegí una hora futura.
                            </div>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputLabel}>Cliente</div>

                        {clienteSeleccionado ? (
                            <div className={styles.selectedClientBox}>
                                <div className={styles.selectedClientInfo}>
                                    <div className={styles.selectedClientName}>
                                        {clienteSeleccionado.nombre}
                                    </div>
                                    <div className={styles.selectedClientMeta}>
                                        {[
                                            clienteSeleccionado.telefono,
                                            clienteSeleccionado.email,
                                            (clienteSeleccionado.Autos || [])
                                                .map((a) => a.patente)
                                                .filter(Boolean)
                                                .join(" · "),
                                        ]
                                            .filter(Boolean)
                                            .join(" — ")}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.changeClientBtn}
                                    onClick={clearClienteSeleccionado}
                                >
                                    Cambiar
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    className={styles.input}
                                    placeholder="Buscar por nombre, teléfono, email o patente…"
                                    value={clienteSearch}
                                    onChange={(e) => {
                                        setClienteSearch(e.target.value);
                                        setNewAppt((p) => ({
                                            ...p,
                                            cliente_id: "",
                                            auto_id: "",
                                        }));
                                    }}
                                />

                                <div className={styles.clientSearchResults}>
                                    {clientesFiltrados.length === 0 ? (
                                        <div className={styles.clientSearchEmpty}>
                                            No se encontraron clientes.
                                        </div>
                                    ) : (
                                        clientesFiltrados.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={styles.clientResultItem}
                                                onClick={() => selectCliente(c)}
                                            >
                                                <div className={styles.clientResultName}>
                                                    {c.nombre}
                                                </div>
                                                <div className={styles.clientResultMeta}>
                                                    {[
                                                        c.telefono,
                                                        c.email,
                                                        (c.Autos || [])
                                                            .map((a) => a.patente)
                                                            .filter(Boolean)
                                                            .join(" · "),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" — ")}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputLabel}>Vehículo</div>
                        <select
                            className={styles.input}
                            value={newAppt.auto_id}
                            onChange={(e) =>
                                setNewAppt((p) => ({ ...p, auto_id: e.target.value }))
                            }
                            disabled={!newAppt.cliente_id}
                        >
                            <option value="">Seleccionar vehículo…</option>
                            {autosDelCliente.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.marca} {a.modelo} — {a.patente}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputLabel}>Servicio</div>
                        <select
                            className={styles.input}
                            value={newAppt.servicio_id}
                            onChange={(e) =>
                                setNewAppt((p) => ({ ...p, servicio_id: e.target.value }))
                            }
                        >
                            <option value="">Seleccionar servicio…</option>
                            {servicios.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre} — ${Number(s.precio).toLocaleString("es-AR")}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                        Cancelar
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={addAppt}
                        disabled={confirmDisabled}
                        title={turnoEsPasado ? "Este horario ya pasó" : undefined}
                    >
                        {saving ? "Agendando…" : "Confirmar turno"}
                    </button>
                </div>
            </div>
        </div>
    );
}