
// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function BookingFooterSection({ telefono }) {
  return <footer className={styles.footer}>¿Preguntas? Llamá al <strong>{telefono}</strong></footer>;
}
