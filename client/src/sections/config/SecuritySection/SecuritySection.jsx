import { SecurityCard } from "../../../components/config/SecurityCard/SecurityCard";
import layoutStyles from "../../../styles/config/ConfigPageLayout.module.css";

export function SecuritySection({
    email,
    emailVerified,
    resendingVerification,
    sendingPasswordReset,
    onResendVerification,
    onSendPasswordReset,
    onDeleteAccount,
    deletingAccount,
}) {
    return (
        <div className={layoutStyles.gridColumn}>
            <SecurityCard
                email={email}
                emailVerified={emailVerified}
                resendingVerification={resendingVerification}
                sendingPasswordReset={sendingPasswordReset}
                onResendVerification={onResendVerification}
                onSendPasswordReset={onSendPasswordReset}
                onDeleteAccount={onDeleteAccount}
                deletingAccount={deletingAccount}
            />
        </div>
    );
}