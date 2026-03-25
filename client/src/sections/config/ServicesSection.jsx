
// Components
import { ServicesCard } from "../../components/config/ServicesCard/ServicesCard";

// Style
import layoutStyles from "../../styles/config/ConfigPageLayout.module.css";


export function ServicesSection({
    operacion,
    form,
    setForm,
    editing,
    setEditing,
    saveServicio,
    saving,
    deleteServicio,
}) {
    return (
        <div className={layoutStyles.gridColumn}>
            <ServicesCard
                operacion={operacion}
                form={form}
                setForm={setForm}
                editing={editing}
                setEditing={setEditing}
                saveServicio={saveServicio}
                saving={saving}
                deleteServicio={deleteServicio}
            />
        </div>
    );
}