
// Hooks
import { useConfigPage } from "../../hooks/useConfigPage";

// Components
import { LoadingState } from "../../components/LoadingState/LoadingState";

// Section
import { ConfigHeaderSection } from "../../sections/config/ConfigHeaderSection/ConfigHeaderSection";
import { BusinessSection } from "../../sections/config/BusinessSection/BusinessSection";
import { ServicesSection } from "../../sections/config/ServicesSection/ServicesSection";
import { OperationScheduleSection } from "../../sections/config/OperationScheduleSection/OperationScheduleSection";

// Style
import layoutStyles from "../../styles/config/ConfigPageLayout.module.css";

export function ConfigPage({ showToast }) {
    const {
        loading,
        operacion,
        setOperacion,
        negocioForm,
        setNegocioForm,
        configEditing,
        setConfigEditing,
        form,
        setForm,
        editing,
        setEditing,
        saving,
        savingConfig,
        cancelConfiguracionGeneral,
        saveConfiguracionGeneral,
        saveServicio,
        deleteServicio,
        handleHorarioChange,
    } = useConfigPage(showToast);

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className={layoutStyles.pageContent}>
            <ConfigHeaderSection
                configEditing={configEditing}
                setConfigEditing={setConfigEditing}
                cancelConfiguracionGeneral={cancelConfiguracionGeneral}
                saveConfiguracionGeneral={saveConfiguracionGeneral}
                savingConfig={savingConfig}
            />

            <div className={layoutStyles.pageGrid}>
                <BusinessSection
                    negocioForm={negocioForm}
                    setNegocioForm={setNegocioForm}
                    disabled={!configEditing}
                />

                <ServicesSection
                    operacion={operacion}
                    form={form}
                    setForm={setForm}
                    editing={editing}
                    setEditing={setEditing}
                    saveServicio={saveServicio}
                    saving={saving}
                    deleteServicio={deleteServicio}
                />

                <OperationScheduleSection
                    operacion={operacion}
                    setOperacion={setOperacion}
                    handleHorarioChange={handleHorarioChange}
                    disabled={!configEditing}
                />
            </div>
        </div>
    );
}