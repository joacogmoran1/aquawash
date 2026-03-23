import { useAuth } from "../../context/AuthContext";
import { useConfigPage } from "../../hooks/useConfigPage";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { ConfigHeaderSection } from "../../sections/config/ConfigHeaderSection/ConfigHeaderSection";
import { BusinessSection } from "../../sections/config/BusinessSection/BusinessSection";
import { ServicesSection } from "../../sections/config/ServicesSection/ServicesSection";
import { OperationScheduleSection } from "../../sections/config/OperationScheduleSection/OperationScheduleSection";
import { SecuritySection } from "../../sections/config/SecuritySection/SecuritySection";
import layoutStyles from "../../styles/config/ConfigPageLayout.module.css";

export function ConfigPage({ showToast }) {
    const { user } = useAuth();

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
        resendingVerification,
        sendingPasswordReset,
        cancelConfiguracionGeneral,
        saveConfiguracionGeneral,
        saveServicio,
        deleteServicio,
        sendPasswordResetEmail,
        handleHorarioChange,
        deletingAccount,
        deleteUserAccount,
    } = useConfigPage(showToast);

    if (loading) return <LoadingState />;

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
                <div className={layoutStyles.gridColumn}>
                    <BusinessSection
                        negocioForm={negocioForm}
                        setNegocioForm={setNegocioForm}
                        disabled={!configEditing}
                    />
                </div>

                <div className={layoutStyles.gridColumn}>
                    <SecuritySection
                        email={negocioForm.email}
                        emailVerified={Boolean(user?.email_verified)}
                        resendingVerification={resendingVerification}
                        sendingPasswordReset={sendingPasswordReset}
                        onSendPasswordReset={sendPasswordResetEmail}
                        onDeleteAccount={deleteUserAccount}
                        deletingAccount={deletingAccount}
                    />
                </div>

                <div className={`${layoutStyles.fullWidth} ${layoutStyles.gridColumn}`}>
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
                </div>

                <div className={`${layoutStyles.fullWidth} ${layoutStyles.gridColumn}`}>
                    <OperationScheduleSection
                        operacion={operacion}
                        setOperacion={setOperacion}
                        handleHorarioChange={handleHorarioChange}
                        disabled={!configEditing}
                    />
                </div>
            </div>
        </div>
    );
}