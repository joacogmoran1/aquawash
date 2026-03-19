
// Style
import shared from "../../../styles/dashboard/Shared.module.css";

export function ConfirmModal({
    open,
    title,
    children,
    onClose,
    actions,
    maxWidth,
}) {
    if (!open) return null;

    return (
        <div
            className={shared.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className={shared.modal} style={maxWidth ? { maxWidth } : undefined}>
                <div className={shared.modalTitle}>{title}</div>
                {children}
                <div className={shared.modalActions}>{actions}</div>
            </div>
        </div>
    );
}