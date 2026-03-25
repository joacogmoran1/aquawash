import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Api
import api from '../../api/api';

// Sections
import { BookingHeaderSection } from '../../sections/booking/BookingHeaderSection';
import { BookingProgressSection } from '../../sections/booking/BookingProgressSection';
import { WelcomeSection } from '../../sections/booking/WelcomeSection';
import { LookupSection } from '../../sections/booking/LookupSection';
import { ReturningClientSection } from '../../sections/booking/ReturningClientSection';
import { NewClientSection } from '../../sections/booking/NewClientSection';
import { CalendarSection } from '../../sections/booking/CalendarSection';
import { SuccessSection } from '../../sections/booking/SuccessSection';
import { BookingFooterSection } from '../../sections/booking/BookingFooterSection';

// Utils
import { INIT_FORM, INIT_NEW_AUTO } from '../../utils/booking/constants';
import { validateNewAuto, validateNewClientForm } from '../../utils/booking/validators';
import { formatFechaLarga } from '../../utils/booking/formatters';

// Style
import styles from '../../styles/booking/BookingPage.module.css';

export function BookingPage() {
    const { lavaderoId } = useParams();

    const [lavadero, setLavadero] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [pageLoad, setPageLoad] = useState(true);
    const [pageError, setPageError] = useState('');

    const [step, setStep] = useState('welcome');

    const [form, setForm] = useState(INIT_FORM);

    const [dniInput, setDniInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    const [selectedAutoId, setSelectedAutoId] = useState('');
    const [showNewAutoForm, setShowNewAutoForm] = useState(false);
    const [newAutoForm, setNewAutoForm] = useState(INIT_NEW_AUTO);

    const [servicioId, setServicioId] = useState('');
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');

    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsMsg, setSlotsMsg] = useState('');

    const [formError, setFormError] = useState('');
    const [booking, setBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    useEffect(() => {
        if (!lavaderoId) {
            setPageError('URL de reserva inválida.');
            setPageLoad(false);
            return;
        }

        fetch(`${api}/public/${lavaderoId}/info`)
            .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d)))
            .then(data => {
                setLavadero(data.lavadero);
                setServicios(data.servicios);
            })
            .catch(e => setPageError(e?.error || 'No se encontró este lavadero.'))
            .finally(() => setPageLoad(false));
    }, [lavaderoId]);

    useEffect(() => {
        setHora('');
        setSlots([]);
        setSlotsMsg('');
        if (!servicioId || !fecha) return;

        let cancelled = false;
        setSlotsLoading(true);
        const params = new URLSearchParams({ servicio_id: servicioId, fecha });

        fetch(`${api}/public/${lavaderoId}/slots?${params}`)
            .then(r => r.ok ? r.json() : { slots: [] })
            .then(data => {
                if (cancelled) return;
                setSlots(data.slots || []);
                if (!(data.slots || []).length) {
                    setSlotsMsg(data.mensaje || 'Sin horarios disponibles. Probá con otra fecha.');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSlots([]);
                    setSlotsMsg('No se pudieron cargar los horarios.');
                }
            })
            .finally(() => {
                if (!cancelled) setSlotsLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lavaderoId, servicioId, fecha]);

    function setF(k, v) {
        setForm(p => ({ ...p, [k]: v }));
        setFormError('');
    }

    function setNA(k, v) {
        setNewAutoForm(p => ({ ...p, [k]: v }));
        setFormError('');
    }

    function scrollTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetTurno() {
        setServicioId('');
        setFecha('');
        setHora('');
        setSlots([]);
    }

    async function handleLookup() {
        setLookupError('');
        const dni = dniInput.replace(/\D/g, '');

        if (dni.length < 6) {
            setLookupError('Ingresá tu número de documento (mínimo 6 dígitos).');
            return;
        }

        if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
            setLookupError('Ingresá un email válido.');
            return;
        }

        setLookupLoading(true);

        try {
            const res = await fetch(`${api}/public/${lavaderoId}/lookup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni, email: emailInput.trim().toLowerCase() }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setLookupError(data.error || 'Los datos ingresados no coinciden con ningún cliente registrado.');
                return;
            }

            setLookupResult(data);
            setSelectedAutoId('');
            setShowNewAutoForm(false);
            setNewAutoForm(INIT_NEW_AUTO);
            setStep('returning');
            scrollTop();
        } catch {
            setLookupError('Error de conexión. Verificá tu internet e intentá de nuevo.');
        } finally {
            setLookupLoading(false);
        }
    }

    function goCalendarFromNew() {
        const err = validateNewClientForm(form);
        if (err) {
            setFormError(err);
            return;
        }

        setFormError('');
        resetTurno();
        setStep('calendar');
        scrollTop();
    }

    function goCalendarFromReturning() {
        setFormError('');

        if (!selectedAutoId && !showNewAutoForm) {
            setFormError('Seleccioná un vehículo o agregá uno nuevo.');
            return;
        }

        if (showNewAutoForm) {
            const err = validateNewAuto(newAutoForm);
            if (err) {
                setFormError(err);
                return;
            }
        }

        resetTurno();
        setStep('calendar');
        scrollTop();
    }

    async function handleSubmit() {
        setFormError('');
        if (!servicioId) { setFormError('Seleccioná un servicio.'); return; }
        if (!fecha) { setFormError('Seleccioná una fecha en el calendario.'); return; }
        if (!hora) { setFormError('Seleccioná un horario disponible.'); return; }

        setBooking(true);
        try {
            let payload = { servicio_id: servicioId, fecha, hora };

            if (step === 'calendar' && lookupResult) {
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

            const res = await fetch(`${api}/public/${lavaderoId}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setFormError(data.error || 'No se pudo agendar el turno. Intentá de nuevo.');
                return;
            }

            setBookingResult(data.turno);
            setStep('success');
            scrollTop();
        } catch {
            setFormError('Error de conexión. Verificá tu internet e intentá de nuevo.');
        } finally {
            setBooking(false);
        }
    }

    const servicioSel = servicios.find(s => s.id === servicioId);
    const isReturning = !!lookupResult;

    if (pageLoad) {
        return <div className={styles.page}><p className={styles.loadingText}>Cargando…</p></div>;
    }

    if (pageError) {
        return (
            <div className={styles.page}>
                <div className={styles.errorPage}><div style={{ fontSize: 32 }}>⚠️</div><p className={styles.errorMsg}>{pageError}</p></div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <BookingHeaderSection lavadero={lavadero} />
                <BookingProgressSection step={step} />

                {step === 'welcome' && (
                    <WelcomeSection
                        onExistingClient={() => {
                            setLookupResult(null);
                            setStep('lookup');
                            setDniInput('');
                            setEmailInput('');
                            setLookupError('');
                            scrollTop();
                        }}
                        onNewClient={() => {
                            setLookupResult(null);
                            setStep('new-form');
                            setForm(INIT_FORM);
                            setFormError('');
                            scrollTop();
                        }}
                    />
                )}

                {step === 'lookup' && (
                    <LookupSection
                        dniInput={dniInput}
                        emailInput={emailInput}
                        lookupError={lookupError}
                        lookupLoading={lookupLoading}
                        setStep={setStep}
                        setDniInput={setDniInput}
                        setEmailInput={setEmailInput}
                        setLookupError={setLookupError}
                        handleLookup={handleLookup}
                        setForm={setForm}
                        setFormError={setFormError}
                        scrollTop={scrollTop}
                        initForm={INIT_FORM}
                    />
                )}

                {step === 'returning' && lookupResult && (
                    <ReturningClientSection
                        lookupResult={lookupResult}
                        selectedAutoId={selectedAutoId}
                        showNewAutoForm={showNewAutoForm}
                        newAutoForm={newAutoForm}
                        formError={formError}
                        setStep={setStep}
                        setSelectedAutoId={setSelectedAutoId}
                        setShowNewAutoForm={setShowNewAutoForm}
                        setFormError={setFormError}
                        setNewAutoForm={setNewAutoForm}
                        setNA={setNA}
                        goCalendarFromReturning={goCalendarFromReturning}
                        initNewAuto={INIT_NEW_AUTO}
                    />
                )}

                {step === 'new-form' && (
                    <NewClientSection
                        form={form}
                        formError={formError}
                        setStep={setStep}
                        setF={setF}
                        goCalendarFromNew={goCalendarFromNew}
                    />
                )}

                {step === 'calendar' && (
                    <CalendarSection
                        servicios={servicios}
                        servicioId={servicioId}
                        setServicioId={setServicioId}
                        setFormError={setFormError}
                        setFecha={setFecha}
                        setHora={setHora}
                        lavadero={lavadero}
                        fecha={fecha}
                        slotsLoading={slotsLoading}
                        slots={slots}
                        slotsMsg={slotsMsg}
                        formatFechaLarga={formatFechaLarga}
                        hora={hora}
                        servicioSel={servicioSel}
                        isReturning={isReturning}
                        lookupResult={lookupResult}
                        selectedAutoId={selectedAutoId}
                        newAutoForm={newAutoForm}
                        form={form}
                        formError={formError}
                        setStep={setStep}
                        scrollTop={scrollTop}
                        handleSubmit={handleSubmit}
                        booking={booking}
                    />
                )}

                {step === 'success' && bookingResult && (
                    <SuccessSection bookingResult={bookingResult} lavadero={lavadero} formatFechaLarga={formatFechaLarga} />
                )}

                {lavadero?.telefono && step !== 'success' && <BookingFooterSection telefono={lavadero.telefono} />}
            </div>
        </div>
    );
}
