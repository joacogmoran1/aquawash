
// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function BookingHeaderSection({ lavadero }) {
  return (
    <header className={styles.header}>
      <div className={styles.brandMark}>AQUAWASH</div>
      <h1 className={styles.lavaderoName}>{lavadero?.nombre}</h1>
      {lavadero?.direccion && <p className={styles.lavaderoAddress}>📍 {lavadero.direccion}</p>}
    </header>
  );
}
