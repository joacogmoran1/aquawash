// Utils
import { dateKey } from "../../../utils/dateUtils";

// Styles
import styles from "../../../styles/calendar/CalendarGrid.module.css";

export function CalendarGrid({
    days,
    turnos,
    selected,
    today,
    setSelected,
    diaEsPasado,
    WEEKDAYS,
}) {
    return (
        <>
            <div className={styles.calWeekdays}>
                {WEEKDAYS.map((w) => (
                    <div className={styles.calWeekday} key={w.key}>
                        {w.short}
                    </div>
                ))}
            </div>

            <div className={styles.calDays}>
                {days.map(({ date, current }, i) => {
                    const k = dateKey(date);
                    const isToday = k === dateKey(today);
                    const isSel = k === selected;
                    const hasEvt = !!turnos[k]?.length;
                    const isPast = diaEsPasado(k);

                    return (
                        <div
                            key={`${k}-${i}`}
                            className={[
                                styles.calDay,
                                !current ? styles.calDayOtherMonth : "",
                                isToday && !isSel ? styles.calDayToday : "",
                                isSel ? styles.calDaySelected : "",
                                hasEvt && !isSel ? styles.calDayHasEvents : "",
                                isPast && current ? styles.calDayPast : "",
                            ].join(" ")}
                            onClick={() => current && setSelected(k)}
                            title={isPast ? "Día pasado" : undefined}
                        >
                            {date.getDate()}
                        </div>
                    );
                })}
            </div>
        </>
    );
}