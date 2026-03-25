
// Components
import { Modal } from "../../Modal/Modal";

export function ConfirmModal({ open, title, children, onClose, actions, maxWidth }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            actions={actions}
            size="sm"
            style={maxWidth ? { maxWidth } : undefined}
        >
            {children}
        </Modal>
    );
}