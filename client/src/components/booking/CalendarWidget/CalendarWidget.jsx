import { useState } from 'react';

// Components
import { Icon } from '../../Icon/Icon';

// Utils
import { MAX_DAYS, MONTHS, WEEKDAYS } from '../../../utils/constants';
import { buildCalendarDays, lavaderoAbre, toDateKey } from '../../../utils/booking/calendar';

// Style
import styles from '../../../styles/booking/BookingPage.module.css';

export function CalendarWidget({ lavadero, selectedDate, onSelectDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_DAYS);

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const cells = buildCalendarDays(calYear, calMonth);

  function prev() {
    if (calMonth === 0) {
      setCalYear(y => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth(m => m - 1);
    }
  }

  function next() {
    if (calMonth === 11) {
      setCalYear(y => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth(m => m + 1);
    }
  }

  function isDisabled(date, current) {
    if (!current) return true;
    if (date < today) return true;
    if (date > maxDate) return true;
    if (!lavaderoAbre(lavadero, date)) return true;
    return false;
  }

  return (
    <div className={styles.calWidget}>
      <div className={styles.calHeader}>
        <span className={styles.calMonthTitle}>{MONTHS[calMonth].toUpperCase()} {calYear}</span>
        <div className={styles.calNavBtns}>
          <button className={styles.calNavBtn} onClick={prev} aria-label="Mes anterior"><Icon name="chevLeft" size={16} /></button>
          <button className={styles.calNavBtn} onClick={next} aria-label="Mes siguiente"><Icon name="chevRight" size={16} /></button>
        </div>
      </div>

      <div className={styles.calWeekdays}>
        {WEEKDAYS.map(w => <span key={w} className={styles.calWeekday}>{w}</span>)}
      </div>

      <div className={styles.calGrid}>
        {cells.map(({ date, current }, i) => {
          const key = toDateKey(date);
          const disabled = isDisabled(date, current);
          const isSel = key === selectedDate && current;
          const isToday = toDateKey(date) === toDateKey(today) && current;
          const isClosed = current && date >= today && date <= maxDate && !lavaderoAbre(lavadero, date);

          return (
            <button
              key={`${key}-${i}`}
              className={[
                styles.calDay,
                !current ? styles.calDayOther : '',
                isSel ? styles.calDaySelected : '',
                isToday && !isSel ? styles.calDayToday : '',
                disabled ? styles.calDayDisabled : '',
              ].filter(Boolean).join(' ')}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(key)}
            >
              <span className={styles.calDayNum}>{date.getDate()}</span>
              {isClosed && <span className={styles.calDayClosed}>Cerrado</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
