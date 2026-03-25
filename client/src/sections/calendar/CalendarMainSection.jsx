// Components
import { CalendarHeader } from "../../components/calendar/CalendarHeader/CalendarHeader.jsx";
import { CalendarGrid } from "../../components/calendar/CalendarGrid/CalendarGrid.jsx";
import { AppointmentList } from "../../components/calendar/AppointmentList/AppointmentList.jsx";
import { StatusLegend } from "../../components/calendar/StatusLegend/StatusLegend.jsx";
import { NewAppointmentModal } from "../../components/calendar/NewAppointmentModal/NewAppointmentModal.jsx";

// Styles
import styles from "../../styles/calendar/CalendarPage.module.css";

export function CalendarMainSection({
    month,
    year,
    MONTHS,
    onPrevMonth,
    onNextMonth,
    days,
    turnos,
    selected,
    today,
    setSelected,
    diaEsPasado,
    WEEKDAYS,
    loading,
    selTurnos,
    selD,
    selM,
    selectedEsPasado,
    openModal,
    deleteAppt,
    showModal,
    setShowModal,
    newAppt,
    setNewAppt,
    turnoEsPasado,
    clienteSeleccionado,
    clearClienteSeleccionado,
    clienteSearch,
    setClienteSearch,
    clientesFiltrados,
    selectCliente,
    autosDelCliente,
    servicios,
    addAppt,
    confirmDisabled,
    saving,
}) {
    return (
        <div className={styles.pageContent}>
            <div className={styles.calendarGrid}>
                <div className={styles.card}>
                    <CalendarHeader
                        month={month}
                        year={year}
                        MONTHS={MONTHS}
                        onPrevMonth={onPrevMonth}
                        onNextMonth={onNextMonth}
                    />

                    <CalendarGrid
                        days={days}
                        turnos={turnos}
                        selected={selected}
                        today={today}
                        setSelected={setSelected}
                        diaEsPasado={diaEsPasado}
                        WEEKDAYS={WEEKDAYS}
                    />
                </div>

                <div className={styles.sideColumn}>
                    <AppointmentList
                        loading={loading}
                        selTurnos={selTurnos}
                        selD={selD}
                        selM={selM}
                        MONTHS={MONTHS}
                        selectedEsPasado={selectedEsPasado}
                        openModal={openModal}
                        deleteAppt={deleteAppt}
                    />

                    <StatusLegend />
                </div>
            </div>

            <NewAppointmentModal
                showModal={showModal}
                setShowModal={setShowModal}
                selD={selD}
                selM={selM}
                newAppt={newAppt}
                setNewAppt={setNewAppt}
                turnoEsPasado={turnoEsPasado}
                clienteSeleccionado={clienteSeleccionado}
                clearClienteSeleccionado={clearClienteSeleccionado}
                clienteSearch={clienteSearch}
                setClienteSearch={setClienteSearch}
                clientesFiltrados={clientesFiltrados}
                selectCliente={selectCliente}
                autosDelCliente={autosDelCliente}
                servicios={servicios}
                addAppt={addAppt}
                confirmDisabled={confirmDisabled}
                saving={saving}
            />
        </div>
    );
}
