
// Components
import { SummaryRow } from '../../components/booking/SummaryRow/SummaryRow';

// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function SuccessSection({ bookingResult, lavadero, formatFechaLarga }) {
  return (
    <div className={styles.card}>
      <div className={styles.successWrap}>
        <div style={{ fontSize: 52, lineHeight: 1 }}>✅</div>
        <h2 className={styles.successTitle}>¡Turno confirmado!</h2>
        <p className={styles.successMsg}>Tu reserva fue registrada exitosamente. Guardá este comprobante.</p>
        <div className={styles.summary}>
          <p className={styles.summaryTitle}>COMPROBANTE</p>
          <SummaryRow label="Lavadero" value={bookingResult.lavadero} />
          <SummaryRow label="Servicio" value={bookingResult.servicio} />
          <SummaryRow label="Precio" value={`$${Number(bookingResult.precio).toLocaleString('es-AR')}`} highlight />
          <SummaryRow label="Fecha" value={formatFechaLarga(bookingResult.fecha)} />
          <SummaryRow label="Hora" value={bookingResult.hora} />
          <SummaryRow label="Vehículo" value={bookingResult.auto} />
        </div>
        {lavadero?.telefono && (
          <p className={styles.successNote}>
            Para cancelar o modificar tu turno, comunicarte al <strong>{lavadero.telefono}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
