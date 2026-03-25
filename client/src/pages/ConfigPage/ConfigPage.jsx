import { useState } from "react";

// Context
import { useAuth } from "../../context/AuthContext";

// Hooks
import { useConfigPage } from "../../hooks/useConfigPage";

// Sections
import { ConfigHeaderSection } from "../../sections/config/ConfigHeaderSection/ConfigHeaderSection";
import { BusinessSection } from "../../sections/config/BusinessSection/BusinessSection";
import { ServicesSection } from "../../sections/config/ServicesSection/ServicesSection";
import { OperationScheduleSection } from "../../sections/config/OperationScheduleSection/OperationScheduleSection";
import { SecuritySection } from "../../sections/config/SecuritySection/SecuritySection";

// Components
import { PageLoading } from "../../components/PageLoading/PageLoading";

// Styles
import layoutStyles from "../../styles/config/ConfigPageLayout.module.css";
import shared from "../../styles/config/SharedCard.module.css";

// ─── Tarjeta: link de turnos online ─────────────────────────────────────────
function BookingLinkCard({ lavaderoId }) {
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/book/${lavaderoId}`;

    function handleCopy() {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            // Fallback para navegadores sin clipboard API
            const ta = document.createElement("textarea");
            ta.value = url;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div className={`${shared.card} ${shared.cardFill}`}>
            <div className={shared.sectionTitle}>Turnos Online</div>

            <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.55, marginBottom: 16 }}>
                Compartí este link con tus clientes para que puedan reservar un turno
                directamente desde cualquier dispositivo, sin necesidad de llamar.
            </p>

            <div className={shared.inputGroup}>
                <div className={shared.inputLabel}>Link público de reservas</div>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        className={shared.input}
                        value={url}
                        readOnly
                        onClick={(e) => e.target.select()}
                        style={{ fontFamily: "var(--font-mono)", fontSize: 12, cursor: "pointer" }}
                    />
                    <button
                        className={shared.primaryButton}
                        onClick={handleCopy}
                        style={{ flexShrink: 0, minWidth: 80 }}
                    >
                        {copied ? "✓ Copiado" : "Copiar"}
                    </button>
                </div>
            </div>

            <p style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 10 }}>
                Los clientes podrán registrarse y elegir fecha, horario y servicio por su cuenta.
            </p>
        </div>
    );
}

// ─── Página principal ────────────────────────────────────────────────────────
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

    if (loading) return <PageLoading />;
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

                {/* Link de turnos online — span completo */}
                {user?.id && (
                    <div className={`${layoutStyles.fullWidth} ${layoutStyles.gridColumn}`}>
                        <BookingLinkCard lavaderoId={user.id} />
                    </div>
                )}

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