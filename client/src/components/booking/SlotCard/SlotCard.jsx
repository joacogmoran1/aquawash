
// Style
import styles from '../../../styles/booking/BookingPage.module.css';

export function SlotCard({ slot, selected, onClick }) {
  const pct = slot.disponibles / slot.capacidad;
  const color = pct <= 0.25 ? 'var(--red)' : pct <= 0.6 ? 'var(--orange)' : 'var(--green)';

  return (
    <button
      className={[styles.slotCard, selected ? styles.slotCardSelected : ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <span className={styles.slotHora}>{slot.hora}</span>
      <div className={styles.slotDots}>
        {Array.from({ length: slot.capacidad }, (_, i) => (
          <span
            key={i}
            className={[styles.slotDot, i < (slot.capacidad - slot.disponibles) ? styles.slotDotTaken : ''].join(' ')}
            style={i >= (slot.capacidad - slot.disponibles) ? { background: color } : undefined}
          />
        ))}
      </div>
      <span className={styles.slotDisponibles} style={{ color }}>
        {slot.disponibles === 1 ? '1 lugar' : `${slot.disponibles} lugares`}
      </span>
    </button>
  );
}
