
// Style
import styles from "../../../styles/calendar/StatusLegend.module.css";

const STATUS_ITEMS = [
    { e: "agendado", c: "var(--cyan)" },
    { e: "reservado", c: "var(--cyan)" },
    { e: "confirmado", c: "var(--green)" },
    { e: "completado", c: "var(--muted2)" },
    { e: "cancelado", c: "var(--red)" },
];

export function StatusLegend() {
    return (
        <div className={`${styles.card} ${styles.cardSm}`}>
            <div className={styles.legendTitle}>ESTADOS</div>

            {STATUS_ITEMS.map(({ e, c }) => (
                <div key={e} className={styles.statusLegendItem}>
                    <div className={styles.statusLegendDot} style={{ background: c }} />
                    <span className={styles.statusLegendText}>{e}</span>
                </div>
            ))}
        </div>
    );
}