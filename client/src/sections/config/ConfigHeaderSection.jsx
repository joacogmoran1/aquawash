
// Components
import { ConfigToolbar } from "../../components/config/ConfigToolbar/ConfigToolbar";

export function ConfigHeaderSection({
    configEditing,
    setConfigEditing,
    cancelConfiguracionGeneral,
    saveConfiguracionGeneral,
    savingConfig,
}) {
    return (
        <ConfigToolbar
            configEditing={configEditing}
            setConfigEditing={setConfigEditing}
            cancelConfiguracionGeneral={cancelConfiguracionGeneral}
            saveConfiguracionGeneral={saveConfiguracionGeneral}
            savingConfig={savingConfig}
        />
    );
}