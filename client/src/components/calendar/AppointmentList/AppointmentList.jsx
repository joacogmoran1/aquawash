
// Components
import { Icon } from "../../Icon/Icon.jsx";
import { StatusBadge } from "../../StatusBadge/StatusBadge";
import { EmptyState } from "../../EmptyState/EmptyState.jsx";

// Style
import styles from "../../../styles/calendar/AppointmentList.module.css";

export function AppointmentList({
    loading, selTurnos, selD, selM, MONTHS,
    selectedEsPasado, openModal, deleteAppt,
}) {
    return (
        <div className={`${styles.card} ${styles.cardSm} ${styles.appointmentsCard}`}>
            <div className={styles.sectionHeaderCompact}>
                <div>
                    <div className={styles.selectedDateTitle}>
                        {selD} de {MONTHS[selM - 1]?.label}
                    </div>
                    <div className={styles.selectedDateMeta}>
                        {loading ? "Cargando…" : `${selTurnos.length} TURNO${selTurnos.length !== 1 ? "S" : ""}`}
                    </div>
                </div>
                {!selectedEsPasado && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={openModal}>
                        <Icon name="plus" size={13} /> Agregar
                    </button>
                )}
            </div>

            <div className={styles.appointmentsBody}>
                {selTurnos.length === 0 ? (
                    <EmptyState icon="📅" text="Sin turnos para este día" />
                ) : (
                    <div className={`${styles.apptList} ${styles.apptListFull}`}>
                        {selTurnos.map((t) => (
                            <div className={styles.apptCard} key={t.id}>
                                <div className={styles.apptCardHeader}>
                                    <div>
                                        <div className={styles.apptTime}>⏰ {t.hora?.slice(0, 5) || "—"}</div>
                                        <div className={styles.apptName}>{t.Cliente?.nombre || "—"}</div>
                                        <div className={styles.apptCar}>
                                            {t.Auto ? `${t.Auto.marca} ${t.Auto.modelo} · ${t.Auto.patente}` : "—"}
                                        </div>
                                        <div className={styles.apptBadgeWrap}>
                                            <StatusBadge estado={t.estado} />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn btn-danger btn-sm ${styles.deleteApptButton}`}
                                        onClick={() => deleteAppt(t.id)}
                                    >
                                        <Icon name="trash" size={12} />
                                    </button>
                                </div>
                                <div className={styles.apptService}>
                                    {t.Servicio?.nombre || t.Servicio?.tipo || "—"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}