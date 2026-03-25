
// Components
import { Icon } from "../../Icon/Icon";
import { ConfirmModal } from "../../dashboard/ConfirmModal/ConfirmModal";

export function DeleteClientModal({ deleteId, setDeleteId, doDelete, deleting }) {
    return (
        <ConfirmModal
            open={!!deleteId}
            title="Confirmar eliminación"
            onClose={() => setDeleteId(null)}
            actions={
                <>
                    <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>
                        Cancelar
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={doDelete}
                        disabled={!!deleting}
                    >
                        <Icon name="trash" size={13} />
                        {deleting ? "Eliminando…" : "Eliminar"}
                    </button>
                </>
            }
        >
            <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}>
                ¿Estás seguro que querés eliminar este cliente? Esta acción no se puede deshacer.
            </p>
        </ConfirmModal>
    );
}