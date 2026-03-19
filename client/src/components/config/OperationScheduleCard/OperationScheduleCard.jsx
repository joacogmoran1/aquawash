
// Utils
import { DIAS_SEMANA } from "../../../utils/constants";
import { sanitizeTime } from "../../../utils/config/configSanitizers";

// Style
import shared from "../../../styles/config/SharedCard.module.css";
import styles from "../../../styles/config/OperationScheduleCard.module.css";

export function OperationScheduleCard({
    operacion,
    setOperacion,
    handleHorarioChange,
    disabled = false,
}) {
    return (
        <div className={`${shared.card} ${shared.cardFill}`}>
            <div className={shared.sectionTitle}>Horario de Operación</div>

            <div className={styles.daysScheduleStack}>
                {DIAS_SEMANA.map((d) => (
                    <div key={d.key} className={styles.dayScheduleCard}>
                        <div className={styles.dayScheduleHeader}>
                            <div className={styles.dayScheduleTitle}>{d.label}</div>

                            <label className={shared.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={operacion[d.key] === 1}
                                    disabled={disabled}
                                    onChange={(e) =>
                                        setOperacion((prev) => ({
                                            ...prev,
                                            [d.key]: e.target.checked ? 1 : 0,
                                        }))
                                    }
                                />
                                <span>{operacion[d.key] === 1 ? "Abierto" : "Cerrado"}</span>
                            </label>
                        </div>

                        <div className={styles.dayScheduleGrid}>
                            <div className={shared.inputGroup}>
                                <div className={shared.inputLabel}>Apertura</div>
                                <input
                                    className={shared.input}
                                    type="time"
                                    value={sanitizeTime(operacion[`${d.key}_apertura`] || "")}
                                    onChange={(e) =>
                                        handleHorarioChange(d.key, "apertura", e.target.value)
                                    }
                                    disabled={disabled || operacion[d.key] !== 1}
                                />
                            </div>

                            <div className={shared.inputGroup}>
                                <div className={shared.inputLabel}>Cierre</div>
                                <input
                                    className={shared.input}
                                    type="time"
                                    value={sanitizeTime(operacion[`${d.key}_cierre`] || "")}
                                    onChange={(e) =>
                                        handleHorarioChange(d.key, "cierre", e.target.value)
                                    }
                                    disabled={disabled || operacion[d.key] !== 1}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}