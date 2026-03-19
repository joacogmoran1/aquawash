// Style
import shared from "../../../styles/clients/ClientsShared.module.css";
import styles from "../../../styles/clients/ClientsModal.module.css";

export function NewClientModal({
    showModal,
    setShowModal,
    form,
    setForm,
    addClient,
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
                <div className={styles.modalTitle}>Nuevo Cliente</div>

                <div className={styles.modalForm}>
                    <div className={styles.inputGroup}>
                        <div className={styles.inputLabel}>Nombre completo</div>
                        <input
                            className={styles.input}
                            placeholder="Juan García"
                            value={form.nombre}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, nombre: e.target.value }))
                            }
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputLabel}>Teléfono</div>
                        <input
                            className={styles.input}
                            placeholder="11-1234-5678"
                            value={form.telefono}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, telefono: e.target.value }))
                            }
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputLabel}>Email</div>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="cliente@email.com"
                            value={form.email}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, email: e.target.value }))
                            }
                        />
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button
                        className={`${shared.btn} ${shared.btnGhost}`}
                        onClick={() => setShowModal(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        className={`${shared.btn} ${shared.btnPrimary}`}
                        onClick={addClient}
                        disabled={saving}
                    >
                        {saving ? "Creando…" : "Crear cliente"}
                    </button>
                </div>
            </div>
        </div>
    );
}