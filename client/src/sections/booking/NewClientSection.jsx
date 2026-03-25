
// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function NewClientSection({ form, formError, setStep, setF, goCalendarFromNew }) {
  return (
    <div className={styles.card}>
      <button className={styles.backLink} onClick={() => setStep('welcome')}>← Volver</button>
      <h2 className={styles.cardTitle}>Tus datos</h2>

      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldsetLegend}>INFORMACIÓN PERSONAL</legend>
        <div className={styles.field}>
          <label className={styles.label}>Nombre completo *</label>
          <input className={styles.input} placeholder="Juan García" value={form.nombre} onChange={e => setF('nombre', e.target.value)} maxLength={120} autoComplete="name" />
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Teléfono *</label>
            <input className={styles.input} type="tel" placeholder="11-1234-5678" value={form.telefono} onChange={e => setF('telefono', e.target.value)} maxLength={30} autoComplete="tel" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email <span className={styles.optional}>(opcional)</span></label>
            <input className={styles.input} type="email" placeholder="tu@email.com" value={form.email} onChange={e => setF('email', e.target.value)} maxLength={150} autoComplete="email" />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>DNI <span className={styles.optional}>(opcional — para identificarte en futuras visitas)</span></label>
          <input className={styles.input} type="tel" placeholder="12345678" value={form.dni} onChange={e => setF('dni', e.target.value.replace(/\D/g, ''))} maxLength={12} />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldsetLegend}>TU VEHÍCULO</legend>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Marca *</label>
            <input className={styles.input} placeholder="Toyota" value={form.auto_marca} onChange={e => setF('auto_marca', e.target.value)} maxLength={60} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Modelo *</label>
            <input className={styles.input} placeholder="Corolla" value={form.auto_modelo} onChange={e => setF('auto_modelo', e.target.value)} maxLength={80} />
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Patente *</label>
            <input
              className={styles.input}
              placeholder="ABC 123"
              value={form.auto_patente}
              onChange={e => setF('auto_patente', e.target.value.toUpperCase())}
              maxLength={20}
              style={{ letterSpacing: '2px', textTransform: 'uppercase' }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Color <span className={styles.optional}>(opcional)</span></label>
            <input className={styles.input} placeholder="Blanco" value={form.auto_color} onChange={e => setF('auto_color', e.target.value)} maxLength={40} />
          </div>
          <div className={`${styles.field} ${styles.fieldNarrow}`}>
            <label className={styles.label}>Año <span className={styles.optional}>(opcional)</span></label>
            <input
              className={styles.input}
              type="number"
              placeholder="2022"
              value={form.auto_year}
              onChange={e => setF('auto_year', e.target.value)}
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>
      </fieldset>

      {formError && <p className={styles.error}>{formError}</p>}
      <button className={styles.btnPrimary} onClick={goCalendarFromNew}>Continuar →</button>
    </div>
  );
}
