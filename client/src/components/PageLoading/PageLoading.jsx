import styles from "../../styles/PageLoading.module.css";

export function PageLoading({ text = "Cargando datos…", fullscreen = false }) {
    return (
        <div className={fullscreen ? styles.fullscreenPage : styles.loadingPage}>
            <div className={styles.loadingText}>{text}</div>
        </div>
    );
}
