
// Style
import styles from '../../../styles/booking/BookingPage.module.css';

export function AutoCard({ auto, selected, onClick }) {
  return (
    <button
      className={[styles.autoCard, selected ? styles.autoCardSelected : ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <span className={styles.autoIcon}>🚗</span>
      <div className={styles.autoInfo}>
        <span className={styles.autoTitle}>{auto.marca} {auto.modelo}</span>
        <span className={styles.autoPlate}>{auto.patente}</span>
        {(auto.color || auto.year) && (
          <span className={styles.autoMeta}>{[auto.color, auto.year].filter(Boolean).join(' · ')}</span>
        )}
      </div>
      {selected && <span className={styles.autoCheck}>✓</span>}
    </button>
  );
}
