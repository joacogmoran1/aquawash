import styles from '../../styles/booking/BookingPage.module.css';

export function WelcomeSection({ onExistingClient, onNewClient }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Reservá tu turno</h2>
      <p className={styles.cardSubtitle}>¿Ya sos cliente de este lavadero?</p>
      <div className={styles.welcomeGrid}>
        <button className={styles.welcomeBtn} onClick={onExistingClient}>
          <span className={styles.welcomeBtnIcon}>👋</span>
          <span className={styles.welcomeBtnTitle}>Ya soy cliente</span>
          <span className={styles.welcomeBtnSub}>Ingresá tu DNI para continuar rápido</span>
        </button>
        <button className={styles.welcomeBtn} onClick={onNewClient}>
          <span className={styles.welcomeBtnIcon}>✨</span>
          <span className={styles.welcomeBtnTitle}>Soy nuevo</span>
          <span className={styles.welcomeBtnSub}>Completá tus datos para registrarte</span>
        </button>
      </div>
    </div>
  );
}
