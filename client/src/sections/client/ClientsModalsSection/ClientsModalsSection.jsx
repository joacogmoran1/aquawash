// Components
import { NewClientModal } from "../../../components/client/NewClientModal/NewClientModal";
import { DeleteClientModal } from "../../../components/client/DeleteClientModal/DeleteClientModal";

export function ClientsModalsSection({
    showModal,
    setShowModal,
    form,
    setForm,
    addClient,
    saving,
    deleteId,
    setDeleteId,
    doDelete,
}) {
    return (
        <>
            <NewClientModal
                showModal={showModal}
                setShowModal={setShowModal}
                form={form}
                setForm={setForm}
                addClient={addClient}
                saving={saving}
            />

            <DeleteClientModal
                deleteId={deleteId}
                setDeleteId={setDeleteId}
                doDelete={doDelete}
            />
        </>
    );
}
