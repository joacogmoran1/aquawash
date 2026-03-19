
// Style
import layoutStyles from "../../styles/config/ConfigPageLayout.module.css";
import shared from "../../styles/config/SharedCard.module.css";
import styles from "../../styles/config/OperationScheduleCard.module.css";

export function LoadingState() {
    return (
        <div className={layoutStyles.pageContent}>
            <div className={`${shared.card} ${shared.cardFill}`}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyText}>Cargando…</div>
                </div>
            </div>
        </div>
    );
}