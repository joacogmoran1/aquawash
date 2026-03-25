import { Fragment } from 'react';

// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function BookingProgressSection({ step }) {
  if (step === 'success') return null;

  const stepNum = ['welcome', 'lookup'].includes(step)
    ? 0
    : ['new-form', 'returning'].includes(step)
      ? 1
      : 2;

  return (
    <div className={styles.progress}>
      {[
        { n: 1, label: 'Identificación' },
        { n: 2, label: 'Datos' },
        { n: 3, label: 'Turno' },
      ].map(({ n, label }, i) => (
        <Fragment key={n}>
          {i > 0 && <div className={`${styles.progressLine} ${stepNum >= n - 1 ? styles.active : ''}`} />}
          <div className={`${styles.progressStep} ${stepNum >= n - 1 ? styles.active : ''}`}>
            <span className={styles.progressNum}>{n}</span>
            <span className={styles.progressLabel}>{label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
