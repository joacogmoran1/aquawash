// Components
import { Icon } from "../../Icon/Icon";

// Style
import styles from "../../../styles/calendar/CalendarHeader.module.css";

export function CalendarHeader({ month, year, MONTHS, onPrevMonth, onNextMonth }) {
    return (
        <div className={styles.calHeader}>
            <div className={styles.calMonth}>
                {MONTHS[month]?.label} {year}
            </div>

            <div className={styles.calHeaderActions}>
                <button
                    type="button"
                    className={`btn btn-ghost ${styles.navButton}`}
                    onClick={onPrevMonth}
                >
                    <Icon name="chevLeft" size={14} />
                </button>

                <button
                    type="button"
                    className={`btn btn-ghost ${styles.navButton}`}
                    onClick={onNextMonth}
                >
                    <Icon name="chevRight" size={14} />
                </button>
            </div>
        </div>
    );
}