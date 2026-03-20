// Components
import { SecurityCard } from "../../../components/config/SecurityCard/SecurityCard";

// Style
import layoutStyles from "../../../styles/config/ConfigPageLayout.module.css";

export function SecuritySection({
    email,
    emailVerified,
    resendingVerification,
    sendingPasswordReset,
    onResendVerification,
    onSendPasswordReset,
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
            />
        </div>
    );
}
