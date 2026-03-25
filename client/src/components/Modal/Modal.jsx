
// Style
import styles from '../../styles/Modal.module.css';

export function Modal({ open, onClose, title, children, actions, size = 'md', style }) {
    if (!open) return null;
    return (
        <div
            className={styles.overlay}
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div
                className={[styles.modal, size && styles[size]].filter(Boolean).join(' ')}
                style={style}
            >
                {title && <div className={styles.title}>{title}</div>}
                {children}
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
        </div>
    );
}