// Style
import styles from "../../../styles/clients/ClientsState.module.css";

export function ClientsState({ type }) {
    const map = {
        loading: {
            icon: "⏳",
            text: "Cargando…",
        },
        empty: {
            icon: "👥",
            text: "No se encontraron clientes",
        },
    };

    const state = map[type];

    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{state.icon}</div>
            <div className={styles.emptyText}>{state.text}</div>
        </div>
    );
}