
// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function LookupSection({
  dniInput,
  emailInput,
  lookupError,
  lookupLoading,
  setStep,
  setDniInput,
  setEmailInput,
  setLookupError,
  handleLookup,
  setForm,
  setFormError,
  scrollTop,
  initForm,
}) {
  return (
    <div className={styles.card}>
      <button className={styles.backLink} onClick={() => setStep('welcome')}>← Volver</button>
      <h2 className={styles.cardTitle}>Identificate</h2>
      <p className={styles.cardSubtitle}>Ingresá tu DNI y el email con el que te registraste. Ambos deben coincidir.</p>

      <div className={styles.field}>
        <label className={styles.label}>Número de documento</label>
        <input
          className={`${styles.input} ${styles.inputDNI}`}
          type="tel"
          placeholder="12345678"
          value={dniInput}
          onChange={e => { setDniInput(e.target.value.replace(/\D/g, '')); setLookupError(''); }}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('lookup-email')?.focus()}
          maxLength={12}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          id="lookup-email"
          className={styles.input}
          type="email"
          placeholder="tu@email.com"
          value={emailInput}
          onChange={e => { setEmailInput(e.target.value); setLookupError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          maxLength={150}
          autoComplete="email"
        />
      </div>

      {lookupError && <p className={styles.error}>{lookupError}</p>}

      <button className={styles.btnPrimary} onClick={handleLookup} disabled={lookupLoading}>
        {lookupLoading ? 'Verificando…' : 'Continuar →'}
      </button>

      <p className={styles.lookupNote}>
        Si es la primera vez que venís,{' '}
        <button className={styles.linkBtn} onClick={() => { setStep('new-form'); setForm(initForm); setFormError(''); scrollTop(); }}>
          registrate como cliente nuevo
        </button>.
      </p>
    </div>
  );
}
