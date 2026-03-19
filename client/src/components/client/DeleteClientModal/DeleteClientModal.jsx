// Components
import { Icon } from "../../Icon/Icon";

// Style
import shared from "../../../styles/clients/ClientsShared.module.css";
import styles from "../../../styles/clients/ClientsModal.module.css";

export function DeleteClientModal({
    deleteId,
    setDeleteId,
    doDelete,
}) {
    if (!deleteId) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget) setDeleteId(null);
            }}
        >
            <div className={`${styles.modal} ${styles.modalSm}`}>
                <div className={styles.modalTitle}>Confirmar eliminación</div>

                <p className={styles.modalText}>
                    ¿Estás seguro que querés eliminar este cliente? Esta acción no se puede
                    deshacer.
                </p>

                <div className={styles.modalActions}>
                    <button
                        className={`${shared.btn} ${shared.btnGhost}`}
                        onClick={() => setDeleteId(null)}
                    >
                        Cancelar
                    </button>

                    <button
                        className={`${shared.btn} ${shared.btnDanger}`}
                        onClick={doDelete}
                    >
                        <Icon name="trash" size={13} /> Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}