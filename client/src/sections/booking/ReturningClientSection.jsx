
// Components
import { AutoCard } from '../../components/booking/AutoCard/AutoCard';

// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function ReturningClientSection({
  lookupResult,
  selectedAutoId,
  showNewAutoForm,
  newAutoForm,
  formError,
  setStep,
  setSelectedAutoId,
  setShowNewAutoForm,
  setFormError,
  setNewAutoForm,
  setNA,
  goCalendarFromReturning,
  initNewAuto,
}) {
  return (
    <div className={styles.card}>
      <button className={styles.backLink} onClick={() => setStep('lookup')}>← Volver</button>

      <div className={styles.greetingBox}>
        <div className={styles.greetingAvatar}>
          {(lookupResult.nombre || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className={styles.greetingHola}>¡Hola, {lookupResult.nombre.split(' ')[0]}!</p>
          <p className={styles.greetingSub}>Encontramos tu cuenta. Elegí con qué vehículo vas a venir.</p>
        </div>
      </div>

      {lookupResult.autos.length > 0 && (
        <div className={styles.autosList}>
          {lookupResult.autos.map(auto => (
            <AutoCard
              key={auto.id}
              auto={auto}
              selected={selectedAutoId === auto.id && !showNewAutoForm}
              onClick={() => { setSelectedAutoId(auto.id); setShowNewAutoForm(false); setFormError(''); }}
            />
          ))}
        </div>
      )}

      {!showNewAutoForm ? (
        <button
          className={styles.addAutoBtn}
          onClick={() => { setShowNewAutoForm(true); setSelectedAutoId(''); setNewAutoForm(initNewAuto); setFormError(''); }}
        >
          + Agregar otro vehículo
        </button>
      ) : (
        <div className={styles.newAutoBox}>
          <div className={styles.newAutoBoxHeader}>
            <span className={styles.newAutoBoxTitle}>Nuevo vehículo</span>
            <button className={styles.closeNewAutoBtn} onClick={() => { setShowNewAutoForm(false); setNewAutoForm(initNewAuto); }}>✕</button>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Marca *</label>
              <input className={styles.input} placeholder="Toyota" value={newAutoForm.marca} onChange={e => setNA('marca', e.target.value)} maxLength={60} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Modelo *</label>
              <input className={styles.input} placeholder="Corolla" value={newAutoForm.modelo} onChange={e => setNA('modelo', e.target.value)} maxLength={80} />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Patente *</label>
              <input
                className={styles.input}
                placeholder="ABC 123"
                value={newAutoForm.patente}
                onChange={e => setNA('patente', e.target.value.toUpperCase())}
                maxLength={20}
                style={{ letterSpacing: '2px', textTransform: 'uppercase' }}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Color</label>
              <input className={styles.input} placeholder="Blanco" value={newAutoForm.color} onChange={e => setNA('color', e.target.value)} maxLength={40} />
            </div>
            <div className={`${styles.field} ${styles.fieldNarrow}`}>
              <label className={styles.label}>Año</label>
              <input
                className={styles.input}
                type="number"
                placeholder="2022"
                value={newAutoForm.year}
                onChange={e => setNA('year', e.target.value)}
                min={1900}
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>
        </div>
      )}

      {formError && <p className={styles.error}>{formError}</p>}

      <button className={styles.btnPrimary} onClick={goCalendarFromReturning}>
        Continuar →
      </button>
    </div>
  );
}
