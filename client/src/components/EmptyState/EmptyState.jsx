

// Style
import styles from '../../styles/EmptyState.module.css';

export function EmptyState({ icon, text, className = '', bordered = false }) {
    return (
        <div
            className={[styles.container, bordered && styles.bordered, className]
                .filter(Boolean)
                .join(' ')}
        >
            {icon && <div className={styles.icon}>{icon}</div>}
            <div className={styles.text}>{text}</div>
        </div>
    );
}