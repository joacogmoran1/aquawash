// Components
import { CalendarWidget } from '../../components/booking/CalendarWidget/CalendarWidget';
import { SlotCard } from '../../components/booking/SlotCard/SlotCard';
import { SummaryRow } from '../../components/booking/SummaryRow/SummaryRow';

// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function CalendarSection({
  servicios,
  servicioId,
  setServicioId,
  setFormError,
  setFecha,
  setHora,
  lavadero,
  fecha,
  slotsLoading,
  slots,
  slotsMsg,
  formatFechaLarga,
  hora,
  servicioSel,
  isReturning,
  lookupResult,
  selectedAutoId,
  newAutoForm,
  form,
  formError,
  dniDuplicado,
  onGoToLookup,
  setStep,
  scrollTop,
  handleSubmit,
  booking,
}) {
  return (
    <>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>¿Qué servicio necesitás?</h2>
        {servicios.length === 0 ? (
          <p className={styles.noSlotsText}>Este lavadero no tiene servicios disponibles aún.</p>
        ) : (
          <div className={styles.serviceGrid}>
            {servicios.map(s => (
              <button
                key={s.id}
                type="button"
                className={`${styles.serviceCard} ${servicioId === s.id ? styles.serviceCardActive : ''}`}
                onClick={() => { setServicioId(s.id); setFormError(''); setFecha(''); setHora(''); }}
              >
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceName}>{s.nombre}</span>
                  {s.duracion_estimada_min && <span className={styles.serviceDuration}>~{s.duracion_estimada_min} min</span>}
                </div>
                <span className={styles.servicePrice}>${Number(s.precio).toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {servicioId && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Elegí una fecha</h2>
          <CalendarWidget lavadero={lavadero} selectedDate={fecha} onSelectDate={f => { setFecha(f); setHora(''); setFormError(''); }} />
          <div className={styles.calLegend}>
            <span className={styles.calLegendItem}><span className={`${styles.calLegendDot} ${styles.calLegendOpen}`} />Disponible</span>
            <span className={styles.calLegendItem}><span className={`${styles.calLegendDot} ${styles.calLegendClosed}`} />Cerrado</span>
            <span className={styles.calLegendItem}><span className={`${styles.calLegendDot} ${styles.calLegendSel}`} />Seleccionado</span>
          </div>
        </div>
      )}

      {servicioId && fecha && (
        <div className={styles.card}>
          <div className={styles.slotsHeader}>
            <h2 className={styles.cardTitle} style={{ margin: 0 }}>Horarios</h2>
            <span className={styles.slotsDate}>{formatFechaLarga(fecha)}</span>
          </div>
          {slotsLoading ? (
            <div className={styles.slotsLoading}>
              {[0, 1, 2].map(i => <span key={i} className={styles.spinnerDot} style={{ animationDelay: `${i * 0.18}s` }} />)}
              <span>Buscando horarios…</span>
            </div>
          ) : slots.length === 0 ? (
            <div className={styles.noSlotsBox}><span style={{ fontSize: 28 }}>🗓</span><p>{slotsMsg}</p></div>
          ) : (
            <>
              <div className={styles.slotsLegend}>
                <span className={styles.slotsLegendItem}><span className={styles.slotDot} style={{ background: 'var(--green)' }} />Libre</span>
                <span className={styles.slotsLegendItem}><span className={`${styles.slotDot} ${styles.slotDotTaken}`} />Ocupado</span>
              </div>
              <div className={styles.slotsGrid}>
                {slots.map(slot => (
                  <SlotCard key={slot.hora} slot={slot} selected={hora === slot.hora} onClick={() => { setHora(slot.hora); setFormError(''); }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {hora && servicioSel && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Resumen de tu turno</h2>
          <div className={styles.summary}>
            <SummaryRow label="Servicio" value={servicioSel.nombre} />
            <SummaryRow label="Precio" value={`$${Number(servicioSel.precio).toLocaleString('es-AR')}`} highlight />
            <SummaryRow label="Fecha" value={formatFechaLarga(fecha)} />
            <SummaryRow label="Hora" value={hora} />
            {isReturning ? (
              <>
                <SummaryRow label="A nombre de" value={lookupResult.nombre} />
                <SummaryRow
                  label="Vehículo"
                  value={
                    selectedAutoId
                      ? (() => {
                        const a = lookupResult.autos.find(x => x.id === selectedAutoId);
                        return a ? `${a.marca} ${a.modelo} · ${a.patente}` : '';
                      })()
                      : `${newAutoForm.marca} ${newAutoForm.modelo} · ${newAutoForm.patente}`
                  }
                />
              </>
            ) : (
              <>
                <SummaryRow label="A nombre de" value={form.nombre} />
                <SummaryRow label="Vehículo" value={`${form.auto_marca} ${form.auto_modelo} · ${form.auto_patente}`} />
              </>
            )}
          </div>

          {formError && (
            <div className={styles.errorBlock}>
              <p className={styles.error}>{formError}</p>
              {dniDuplicado && (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={onGoToLookup}
                  style={{ marginTop: 10 }}
                >
                  Ir a "Ya soy cliente" →
                </button>
              )}
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.btnGhost} onClick={() => { setStep(isReturning ? 'returning' : 'new-form'); scrollTop(); }}>
              ← Volver
            </button>
            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={booking}>
              {booking ? 'Agendando…' : 'Confirmar turno'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}