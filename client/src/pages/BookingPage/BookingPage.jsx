import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../styles/booking/BookingPage.module.css';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
const MAX_DAYS = 90;
const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_ARR = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

const INIT_FORM = {
    nombre: '', telefono: '', email: '', dni: '',
    auto_marca: '', auto_modelo: '', auto_patente: '', auto_color: '', auto_year: ''
};
const INIT_NEW_AUTO = { marca: '', modelo: '', patente: '', color: '', year: '' };

// ─── Validadores ───────────────────────────────────────────────────────────────
function validateNewClientForm(f) {
    if (!f.nombre.trim() || f.nombre.trim().length < 2) return 'El nombre completo es requerido.';
    if (!f.telefono.trim()) return 'El teléfono es requerido.';
    if (!/^[0-9+\-() ]+$/.test(f.telefono.trim())) return 'El teléfono contiene caracteres no válidos.';
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return 'El email no es válido.';
    if (!f.auto_marca.trim()) return 'La marca del vehículo es requerida.';
    if (!f.auto_modelo.trim()) return 'El modelo del vehículo es requerido.';
    if (!f.auto_patente.trim()) return 'La patente del vehículo es requerida.';
    if (f.auto_year) {
        const yr = Number(f.auto_year);
        if (!Number.isInteger(yr) || yr < 1900 || yr > new Date().getFullYear() + 1) return 'El año no es válido.';
    }
    return null;
}
function validateNewAuto(f) {
    if (!f.marca.trim()) return 'La marca es requerida.';
    if (!f.modelo.trim()) return 'El modelo es requerido.';
    if (!f.patente.trim()) return 'La patente es requerida.';
    if (f.year) {
        const yr = Number(f.year);
        if (!Number.isInteger(yr) || yr < 1900 || yr > new Date().getFullYear() + 1) return 'El año no es válido.';
    }
    return null;
}

// ─── Calendario ────────────────────────────────────────────────────────────────
function toDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function buildCalendarDays(year, month) {
    const cells = [];
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const start = (first.getDay() + 6) % 7;
    for (let i = start - 1; i >= 0; i--) cells.push({ date: new Date(year, month, -i), current: false });
    for (let i = 1; i <= last.getDate(); i++) cells.push({ date: new Date(year, month, i), current: true });
    while (cells.length < 42)
        cells.push({ date: new Date(year, month + 1, cells.length - last.getDate() - start + 1), current: false });
    return cells;
}
function lavaderoAbre(lav, date) { return !!(lav && lav[DIAS_ARR[date.getDay()]]); }

const ChevLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const ChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;

function CalendarWidget({ lavadero, selectedDate, onSelectDate }) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + MAX_DAYS);
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const cells = buildCalendarDays(calYear, calMonth);

    function prev() { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); }
    function next() { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); }

    function isDisabled(date, current) {
        if (!current) return true;
        if (date < today) return true;
        if (date > maxDate) return true;
        if (!lavaderoAbre(lavadero, date)) return true;
        return false;
    }

    return (
        <div className={styles.calWidget}>
            <div className={styles.calHeader}>
                <span className={styles.calMonthTitle}>{MONTHS[calMonth].toUpperCase()} {calYear}</span>
                <div className={styles.calNavBtns}>
                    <button className={styles.calNavBtn} onClick={prev} aria-label="Mes anterior"><ChevLeft /></button>
                    <button className={styles.calNavBtn} onClick={next} aria-label="Mes siguiente"><ChevRight /></button>
                </div>
            </div>
            <div className={styles.calWeekdays}>
                {WEEKDAYS.map(w => <span key={w} className={styles.calWeekday}>{w}</span>)}
            </div>
            <div className={styles.calGrid}>
                {cells.map(({ date, current }, i) => {
                    const key = toDateKey(date);
                    const disabled = isDisabled(date, current);
                    const isSel = key === selectedDate && current;
                    const isToday = toDateKey(date) === toDateKey(today) && current;
                    const isClosed = current && date >= today && date <= maxDate && !lavaderoAbre(lavadero, date);
                    return (
                        <button
                            key={`${key}-${i}`}
                            className={[
                                styles.calDay,
                                !current ? styles.calDayOther : '',
                                isSel ? styles.calDaySelected : '',
                                isToday && !isSel ? styles.calDayToday : '',
                                disabled ? styles.calDayDisabled : '',
                            ].filter(Boolean).join(' ')}
                            disabled={disabled}
                            onClick={() => !disabled && onSelectDate(key)}
                        >
                            <span className={styles.calDayNum}>{date.getDate()}</span>
                            {isClosed && <span className={styles.calDayClosed}>Cerrado</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── SlotCard ──────────────────────────────────────────────────────────────────
function SlotCard({ slot, selected, onClick }) {
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
                    <span key={i} className={[styles.slotDot, i < (slot.capacidad - slot.disponibles) ? styles.slotDotTaken : ''].join(' ')}
                        style={i >= (slot.capacidad - slot.disponibles) ? { background: color } : undefined} />
                ))}
            </div>
            <span className={styles.slotDisponibles} style={{ color }}>
                {slot.disponibles === 1 ? '1 lugar' : `${slot.disponibles} lugares`}
            </span>
        </button>
    );
}

// ─── AutoCard (vehículo del cliente existente) ─────────────────────────────────
function AutoCard({ auto, selected, onClick }) {
    return (
        <button
            className={[styles.autoCard, selected ? styles.autoCardSelected : ''].filter(Boolean).join(' ')}
            onClick={onClick}
        >
            <span className={styles.autoIcon}>🚗</span>
            <div className={styles.autoInfo}>
                <span className={styles.autoTitle}>{auto.marca} {auto.modelo}</span>
                <span className={styles.autoPlate}>{auto.patente}</span>
                {(auto.color || auto.year) && (
                    <span className={styles.autoMeta}>{[auto.color, auto.year].filter(Boolean).join(' · ')}</span>
                )}
            </div>
            {selected && <span className={styles.autoCheck}>✓</span>}
        </button>
    );
}

function SummaryRow({ label, value, highlight }) {
    return (
        <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{label}</span>
            <span className={`${styles.summaryValue} ${highlight ? styles.summaryValueHighlight : ''}`}>{value}</span>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function BookingPage() {
    const { lavaderoId } = useParams();

    // Datos del negocio
    const [lavadero, setLavadero] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [pageLoad, setPageLoad] = useState(true);
    const [pageError, setPageError] = useState('');

    // Flujo
    // step: 'welcome' | 'lookup' | 'returning' | 'new-form' | 'calendar' | 'success'
    const [step, setStep] = useState('welcome');

    // Cliente nuevo
    const [form, setForm] = useState(INIT_FORM);

    // Cliente existente (lookup)
    const [dniInput, setDniInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [lookupResult, setLookupResult] = useState(null); // { cliente_id, nombre, autos }
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    // Selección auto (returning)
    const [selectedAutoId, setSelectedAutoId] = useState('');
    const [showNewAutoForm, setShowNewAutoForm] = useState(false);
    const [newAutoForm, setNewAutoForm] = useState(INIT_NEW_AUTO);

    // Turno
    const [servicioId, setServicioId] = useState('');
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');

    // Slots
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsMsg, setSlotsMsg] = useState('');

    // Errores y envío
    const [formError, setFormError] = useState('');
    const [booking, setBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    // ── Carga inicial ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!lavaderoId) { setPageError('URL de reserva inválida.'); setPageLoad(false); return; }
        fetch(`${API_BASE}/public/${lavaderoId}/info`)
            .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d)))
            .then(data => { setLavadero(data.lavadero); setServicios(data.servicios); })
            .catch(e => setPageError(e?.error || 'No se encontró este lavadero.'))
            .finally(() => setPageLoad(false));
    }, [lavaderoId]);

    // ── Slots ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        setHora(''); setSlots([]); setSlotsMsg('');
        if (!servicioId || !fecha) return;
        let cancelled = false;
        setSlotsLoading(true);
        const params = new URLSearchParams({ servicio_id: servicioId, fecha });
        fetch(`${API_BASE}/public/${lavaderoId}/slots?${params}`)
            .then(r => r.ok ? r.json() : { slots: [] })
            .then(data => {
                if (cancelled) return;
                setSlots(data.slots || []);
                if (!(data.slots || []).length) setSlotsMsg(data.mensaje || 'Sin horarios disponibles. Probá con otra fecha.');
            })
            .catch(() => { if (!cancelled) { setSlots([]); setSlotsMsg('No se pudieron cargar los horarios.'); } })
            .finally(() => { if (!cancelled) setSlotsLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lavaderoId, servicioId, fecha]);

    // ── Helpers ────────────────────────────────────────────────────────────────
    function setF(k, v) { setForm(p => ({ ...p, [k]: v })); setFormError(''); }
    function setNA(k, v) { setNewAutoForm(p => ({ ...p, [k]: v })); setFormError(''); }
    function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

    function resetTurno() { setServicioId(''); setFecha(''); setHora(''); setSlots([]); }

    // ── Lookup DNI + email ────────────────────────────────────────────────────
    async function handleLookup() {
        setLookupError('');
        const dni = dniInput.replace(/\D/g, '');
        if (dni.length < 6) { setLookupError('Ingresá tu número de documento (mínimo 6 dígitos).'); return; }
        if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) { setLookupError('Ingresá un email válido.'); return; }

        setLookupLoading(true);
        try {
            const res = await fetch(`${API_BASE}/public/${lavaderoId}/lookup`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni, email: emailInput.trim().toLowerCase() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { setLookupError(data.error || 'Los datos ingresados no coinciden con ningún cliente registrado.'); return; }
            setLookupResult(data);
            setSelectedAutoId('');
            setShowNewAutoForm(false);
            setNewAutoForm(INIT_NEW_AUTO);
            setStep('returning');
            scrollTop();
        } catch {
            setLookupError('Error de conexión. Verificá tu internet e intentá de nuevo.');
        } finally { setLookupLoading(false); }
    }

    // ── Avanzar de step 1 (cliente) a calendario ───────────────────────────────
    function goCalendarFromNew() {
        const err = validateNewClientForm(form);
        if (err) { setFormError(err); return; }
        setFormError(''); resetTurno(); setStep('calendar'); scrollTop();
    }

    function goCalendarFromReturning() {
        setFormError('');
        if (!selectedAutoId && !showNewAutoForm) { setFormError('Seleccioná un vehículo o agregá uno nuevo.'); return; }
        if (showNewAutoForm) {
            const err = validateNewAuto(newAutoForm);
            if (err) { setFormError(err); return; }
        }
        resetTurno(); setStep('calendar'); scrollTop();
    }

    // ── Confirmar reserva ──────────────────────────────────────────────────────
    async function handleSubmit() {
        setFormError('');
        if (!servicioId) { setFormError('Seleccioná un servicio.'); return; }
        if (!fecha) { setFormError('Seleccioná una fecha en el calendario.'); return; }
        if (!hora) { setFormError('Seleccioná un horario disponible.'); return; }

        setBooking(true);
        try {
            let payload = { servicio_id: servicioId, fecha, hora };

            if (step === 'calendar' && lookupResult) {
                // Cliente existente
                payload.cliente_id = lookupResult.cliente_id;
                if (selectedAutoId) {
                    payload.auto_id = selectedAutoId;
                } else {
                    payload.auto_marca = newAutoForm.marca.trim();
                    payload.auto_modelo = newAutoForm.modelo.trim();
                    payload.auto_patente = newAutoForm.patente.trim().toUpperCase();
                    payload.auto_color = newAutoForm.color.trim() || undefined;
                    payload.auto_year = newAutoForm.year ? Number(newAutoForm.year) : undefined;
                }
            } else {
                // Cliente nuevo
                payload.nombre = form.nombre.trim();
                payload.telefono = form.telefono.trim();
                payload.email = form.email.trim() || undefined;
                payload.dni = form.dni.replace(/\D/g, '') || undefined;
                payload.auto_marca = form.auto_marca.trim();
                payload.auto_modelo = form.auto_modelo.trim();
                payload.auto_patente = form.auto_patente.trim().toUpperCase();
                payload.auto_color = form.auto_color.trim() || undefined;
                payload.auto_year = form.auto_year ? Number(form.auto_year) : undefined;
            }

            const res = await fetch(`${API_BASE}/public/${lavaderoId}/book`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { setFormError(data.error || 'No se pudo agendar el turno. Intentá de nuevo.'); return; }
            setBookingResult(data.turno);
            setStep('success');
            scrollTop();
        } catch {
            setFormError('Error de conexión. Verificá tu internet e intentá de nuevo.');
        } finally { setBooking(false); }
    }

    function formatFechaLarga(fs) {
        if (!fs) return '';
        return new Date(fs + 'T12:00:00').toLocaleDateString('es-AR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });
    }

    const servicioSel = servicios.find(s => s.id === servicioId);
    const isReturning = !!lookupResult;

    // ── Render helpers ─────────────────────────────────────────────────────────
    function renderProgressBar() {
        if (step === 'success') return null;
        const stepNum = ['welcome', 'lookup'].includes(step) ? 0 :
            ['new-form', 'returning'].includes(step) ? 1 : 2;
        return (
            <div className={styles.progress}>
                {[
                    { n: 1, label: 'Identificación' },
                    { n: 2, label: 'Datos' },
                    { n: 3, label: 'Turno' },
                ].map(({ n, label }, i) => (
                    <>
                        {i > 0 && <div key={`l${n}`} className={`${styles.progressLine} ${stepNum >= n - 1 ? styles.active : ''}`} />}
                        <div key={n} className={`${styles.progressStep} ${stepNum >= n - 1 ? styles.active : ''}`}>
                            <span className={styles.progressNum}>{n}</span>
                            <span className={styles.progressLabel}>{label}</span>
                        </div>
                    </>
                ))}
            </div>
        );
    }

    // ── States de carga/error ──────────────────────────────────────────────────
    if (pageLoad) return <div className={styles.page}><p className={styles.loadingText}>Cargando…</p></div>;
    if (pageError) return (
        <div className={styles.page}>
            <div className={styles.errorPage}><div style={{ fontSize: 32 }}>⚠️</div><p className={styles.errorMsg}>{pageError}</p></div>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.brandMark}>AQUAWASH</div>
                    <h1 className={styles.lavaderoName}>{lavadero?.nombre}</h1>
                    {lavadero?.direccion && <p className={styles.lavaderoAddress}>📍 {lavadero.direccion}</p>}
                </header>

                {renderProgressBar()}

                {/* ── WELCOME ─── */}
                {step === 'welcome' && (
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Reservá tu turno</h2>
                        <p className={styles.cardSubtitle}>¿Ya sos cliente de este lavadero?</p>
                        <div className={styles.welcomeGrid}>
                            <button className={styles.welcomeBtn} onClick={() => { setLookupResult(null); setStep('lookup'); setDniInput(''); setEmailInput(''); setLookupError(''); scrollTop(); }}>
                                <span className={styles.welcomeBtnIcon}>👋</span>
                                <span className={styles.welcomeBtnTitle}>Ya soy cliente</span>
                                <span className={styles.welcomeBtnSub}>Ingresá tu DNI para continuar rápido</span>
                            </button>
                            <button className={styles.welcomeBtn} onClick={() => { setLookupResult(null); setStep('new-form'); setForm(INIT_FORM); setFormError(''); scrollTop(); }}>
                                <span className={styles.welcomeBtnIcon}>✨</span>
                                <span className={styles.welcomeBtnTitle}>Soy nuevo</span>
                                <span className={styles.welcomeBtnSub}>Completá tus datos para registrarte</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── LOOKUP DNI ─── */}
                {step === 'lookup' && (
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
                            <button className={styles.linkBtn} onClick={() => { setStep('new-form'); setForm(INIT_FORM); setFormError(''); scrollTop(); }}>
                                registrate como cliente nuevo
                            </button>.
                        </p>
                    </div>
                )}

                {/* ── RETURNING CLIENT — selección de auto ─── */}
                {step === 'returning' && lookupResult && (
                    <div className={styles.card}>
                        <button className={styles.backLink} onClick={() => setStep('lookup')}>← Volver</button>

                        {/* Saludo — solo nombre, sin datos sensibles */}
                        <div className={styles.greetingBox}>
                            <div className={styles.greetingAvatar}>
                                {(lookupResult.nombre || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className={styles.greetingHola}>¡Hola, {lookupResult.nombre.split(' ')[0]}!</p>
                                <p className={styles.greetingSub}>Encontramos tu cuenta. Elegí con qué vehículo vas a venir.</p>
                            </div>
                        </div>

                        {/* Autos existentes */}
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

                        {/* Toggle agregar nuevo auto */}
                        {!showNewAutoForm ? (
                            <button
                                className={styles.addAutoBtn}
                                onClick={() => { setShowNewAutoForm(true); setSelectedAutoId(''); setNewAutoForm(INIT_NEW_AUTO); setFormError(''); }}
                            >
                                + Agregar otro vehículo
                            </button>
                        ) : (
                            <div className={styles.newAutoBox}>
                                <div className={styles.newAutoBoxHeader}>
                                    <span className={styles.newAutoBoxTitle}>Nuevo vehículo</span>
                                    <button className={styles.closeNewAutoBtn} onClick={() => { setShowNewAutoForm(false); setNewAutoForm(INIT_NEW_AUTO); }}>✕</button>
                                </div>
                                <div className={styles.fieldRow}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Marca *</label>
                                        <input className={styles.input} placeholder="Toyota"
                                            value={newAutoForm.marca} onChange={e => setNA('marca', e.target.value)} maxLength={60} />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Modelo *</label>
                                        <input className={styles.input} placeholder="Corolla"
                                            value={newAutoForm.modelo} onChange={e => setNA('modelo', e.target.value)} maxLength={80} />
                                    </div>
                                </div>
                                <div className={styles.fieldRow}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Patente *</label>
                                        <input className={styles.input} placeholder="ABC 123"
                                            value={newAutoForm.patente}
                                            onChange={e => setNA('patente', e.target.value.toUpperCase())}
                                            maxLength={20} style={{ letterSpacing: '2px', textTransform: 'uppercase' }} />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Color</label>
                                        <input className={styles.input} placeholder="Blanco"
                                            value={newAutoForm.color} onChange={e => setNA('color', e.target.value)} maxLength={40} />
                                    </div>
                                    <div className={`${styles.field} ${styles.fieldNarrow}`}>
                                        <label className={styles.label}>Año</label>
                                        <input className={styles.input} type="number" placeholder="2022"
                                            value={newAutoForm.year} onChange={e => setNA('year', e.target.value)}
                                            min={1900} max={new Date().getFullYear() + 1} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formError && <p className={styles.error}>{formError}</p>}

                        <button className={styles.btnPrimary} onClick={goCalendarFromReturning}>
                            Continuar →
                        </button>
                    </div>
                )}

                {/* ── NEW CLIENT FORM ─── */}
                {step === 'new-form' && (
                    <div className={styles.card}>
                        <button className={styles.backLink} onClick={() => setStep('welcome')}>← Volver</button>
                        <h2 className={styles.cardTitle}>Tus datos</h2>

                        <fieldset className={styles.fieldset}>
                            <legend className={styles.fieldsetLegend}>INFORMACIÓN PERSONAL</legend>
                            <div className={styles.field}>
                                <label className={styles.label}>Nombre completo *</label>
                                <input className={styles.input} placeholder="Juan García"
                                    value={form.nombre} onChange={e => setF('nombre', e.target.value)} maxLength={120} autoComplete="name" />
                            </div>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Teléfono *</label>
                                    <input className={styles.input} type="tel" placeholder="11-1234-5678"
                                        value={form.telefono} onChange={e => setF('telefono', e.target.value)} maxLength={30} autoComplete="tel" />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Email <span className={styles.optional}>(opcional)</span></label>
                                    <input className={styles.input} type="email" placeholder="tu@email.com"
                                        value={form.email} onChange={e => setF('email', e.target.value)} maxLength={150} autoComplete="email" />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>DNI <span className={styles.optional}>(opcional — para identificarte en futuras visitas)</span></label>
                                <input className={styles.input} type="tel" placeholder="12345678"
                                    value={form.dni} onChange={e => setF('dni', e.target.value.replace(/\D/g, ''))} maxLength={12} />
                            </div>
                        </fieldset>

                        <fieldset className={styles.fieldset}>
                            <legend className={styles.fieldsetLegend}>TU VEHÍCULO</legend>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Marca *</label>
                                    <input className={styles.input} placeholder="Toyota"
                                        value={form.auto_marca} onChange={e => setF('auto_marca', e.target.value)} maxLength={60} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Modelo *</label>
                                    <input className={styles.input} placeholder="Corolla"
                                        value={form.auto_modelo} onChange={e => setF('auto_modelo', e.target.value)} maxLength={80} />
                                </div>
                            </div>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Patente *</label>
                                    <input className={styles.input} placeholder="ABC 123"
                                        value={form.auto_patente}
                                        onChange={e => setF('auto_patente', e.target.value.toUpperCase())}
                                        maxLength={20} style={{ letterSpacing: '2px', textTransform: 'uppercase' }} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Color <span className={styles.optional}>(opcional)</span></label>
                                    <input className={styles.input} placeholder="Blanco"
                                        value={form.auto_color} onChange={e => setF('auto_color', e.target.value)} maxLength={40} />
                                </div>
                                <div className={`${styles.field} ${styles.fieldNarrow}`}>
                                    <label className={styles.label}>Año <span className={styles.optional}>(opcional)</span></label>
                                    <input className={styles.input} type="number" placeholder="2022"
                                        value={form.auto_year} onChange={e => setF('auto_year', e.target.value)}
                                        min={1900} max={new Date().getFullYear() + 1} />
                                </div>
                            </div>
                        </fieldset>

                        {formError && <p className={styles.error}>{formError}</p>}
                        <button className={styles.btnPrimary} onClick={goCalendarFromNew}>Continuar →</button>
                    </div>
                )}

                {/* ── CALENDAR + SLOTS ─── */}
                {step === 'calendar' && (
                    <>
                        {/* Servicio */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>¿Qué servicio necesitás?</h2>
                            {servicios.length === 0 ? (
                                <p className={styles.noSlotsText}>Este lavadero no tiene servicios disponibles aún.</p>
                            ) : (
                                <div className={styles.serviceGrid}>
                                    {servicios.map(s => (
                                        <button key={s.id} type="button"
                                            className={`${styles.serviceCard} ${servicioId === s.id ? styles.serviceCardActive : ''}`}
                                            onClick={() => { setServicioId(s.id); setFormError(''); setFecha(''); setHora(''); }}>
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

                        {/* Calendario */}
                        {servicioId && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>Elegí una fecha</h2>
                                <CalendarWidget lavadero={lavadero} selectedDate={fecha}
                                    onSelectDate={f => { setFecha(f); setHora(''); setFormError(''); }} />
                                <div className={styles.calLegend}>
                                    <span className={styles.calLegendItem}><span className={`${styles.calLegendDot} ${styles.calLegendOpen}`} />Disponible</span>
                                    <span className={styles.calLegendItem}><span className={`${styles.calLegendDot} ${styles.calLegendClosed}`} />Cerrado</span>
                                    <span className={styles.calLegendItem}><span className={`${styles.calLegendDot} ${styles.calLegendSel}`} />Seleccionado</span>
                                </div>
                            </div>
                        )}

                        {/* Horarios */}
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
                                                <SlotCard key={slot.hora} slot={slot} selected={hora === slot.hora}
                                                    onClick={() => { setHora(slot.hora); setFormError(''); }} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Resumen + confirmar */}
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
                                            <SummaryRow label="Vehículo" value={
                                                selectedAutoId
                                                    ? (() => { const a = lookupResult.autos.find(x => x.id === selectedAutoId); return a ? `${a.marca} ${a.modelo} · ${a.patente}` : ''; })()
                                                    : `${newAutoForm.marca} ${newAutoForm.modelo} · ${newAutoForm.patente}`
                                            } />
                                        </>
                                    ) : (
                                        <>
                                            <SummaryRow label="A nombre de" value={form.nombre} />
                                            <SummaryRow label="Vehículo" value={`${form.auto_marca} ${form.auto_modelo} · ${form.auto_patente}`} />
                                        </>
                                    )}
                                </div>
                                {formError && <p className={styles.error}>{formError}</p>}
                                <div className={styles.actions}>
                                    <button className={styles.btnGhost}
                                        onClick={() => { setStep(isReturning ? 'returning' : 'new-form'); scrollTop(); }}>
                                        ← Volver
                                    </button>
                                    <button className={styles.btnPrimary} onClick={handleSubmit} disabled={booking}>
                                        {booking ? 'Agendando…' : 'Confirmar turno'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── SUCCESS ─── */}
                {step === 'success' && bookingResult && (
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
                )}

                {lavadero?.telefono && step !== 'success' && (
                    <footer className={styles.footer}>¿Preguntas? Llamá al <strong>{lavadero.telefono}</strong></footer>
                )}

            </div>
        </div>
    );
}