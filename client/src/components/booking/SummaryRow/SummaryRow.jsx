
// Style
import styles from '../../../styles/booking/BookingPage.module.css';

export function SummaryRow({ label, value, highlight }) {
  return (
    <div className={styles.summaryRow}>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={`${styles.summaryValue} ${highlight ? styles.summaryValueHighlight : ''}`}>{value}</span>
    </div>
  );
}
