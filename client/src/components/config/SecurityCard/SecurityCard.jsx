// Style
import shared from "../../../styles/config/SharedCard.module.css";
import styles from "../../../styles/config/SecurityCard.module.css";

export function SecurityCard({
    email,
    emailVerified,
    resendingVerification,
    sendingPasswordReset,
    onResendVerification,
    onSendPasswordReset,
}) {
    return (
        <div className={`${shared.card} ${shared.cardFill}`}>
            <div className={shared.sectionTitle}>Seguridad</div>

            <div className={styles.stack}>
                <div className={styles.statusBox}>
                    <div>
                        <div className={shared.inputLabel}>Estado del email</div>
                        <div className={styles.emailValue}>{email || "Sin email configurado"}</div>
                    </div>
                    <div className={emailVerified ? styles.badgeSuccess : styles.badgeWarning}>
                        {emailVerified ? "Verificado" : "Pendiente"}
                    </div>
                </div>

                <div className={styles.infoBox}>
                    <div className={styles.infoTitle}>Verificación de email</div>
                    <div className={styles.infoText}>
                        Si todavía no validaste tu correo, podés reenviar el enlace de verificación.
                    </div>
                    <button
                        className={shared.ghostButton}
                        onClick={onResendVerification}
                        disabled={!email || resendingVerification || emailVerified}
                    >
                        {resendingVerification ? "Enviando…" : emailVerified ? "Email verificado" : "Reenviar verificación"}
                    </button>
                </div>

                <div className={styles.infoBox}>
                    <div className={styles.infoTitle}>Cambio de contraseña</div>
                    <div className={styles.infoText}>
                        Te enviaremos un enlace seguro a <strong>{email || "tu email"}</strong> para que puedas definir una nueva contraseña.
                    </div>
                    <button
                        className={shared.primaryButton}
                        onClick={onSendPasswordReset}
                        disabled={!email || sendingPasswordReset}
                    >
                        {sendingPasswordReset ? "Enviando enlace…" : "Cambiar contraseña"}
                    </button>
                </div>
            </div>
        </div>
    );
}
