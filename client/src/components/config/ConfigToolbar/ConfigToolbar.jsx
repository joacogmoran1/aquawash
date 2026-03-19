// Components
import { Icon } from "../../Icon/Icon";

// Style
import styles from "../../../styles/config/ConfigToolbar.module.css";

export function ConfigToolbar({
    configEditing,
    setConfigEditing,
    cancelConfiguracionGeneral,
    saveConfiguracionGeneral,
    savingConfig,
}) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.spacer} />

            <div className={styles.actions}>
                {configEditing ? (
                    <>
                        <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={cancelConfiguracionGeneral}
                            disabled={savingConfig}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className={styles.btnPrimary}
                            onClick={saveConfiguracionGeneral}
                            disabled={savingConfig}
                        >
                            <Icon name="save" size={13} />
                            {savingConfig ? "Guardando..." : "Guardar"}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={() => setConfigEditing(true)}
                    >
                        <Icon name="edit" size={13} />
                        Editar
                    </button>
                )}
            </div>
        </div>
    );
}