
// Style
import shared from "../../../styles/config/SharedCard.module.css";

export function BusinessFormCard({
    negocioForm,
    setNegocioForm,
    disabled = false,
}) {
    function updateField(field, value) {
        setNegocioForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    return (
        <div className={`${shared.card} ${shared.cardFill}`}>
            <div className={shared.sectionTitle}>Datos del Negocio</div>

            <div className={shared.formGrid}>
                <div className={shared.inputGroup}>
                    <div className={shared.inputLabel}>Nombre</div>
                    <input
                        className={shared.input}
                        value={negocioForm.nombre}
                        disabled={disabled}
                        onChange={(e) => updateField("nombre", e.target.value)}
                    />
                </div>

                <div className={shared.inputGroup}>
                    <div className={shared.inputLabel}>Email</div>
                    <input
                        className={shared.input}
                        value={negocioForm.email}
                        disabled={disabled}
                        onChange={(e) => updateField("email", e.target.value)}
                    />
                </div>

                <div className={shared.inputGroup}>
                    <div className={shared.inputLabel}>Teléfono</div>
                    <input
                        className={shared.input}
                        value={negocioForm.telefono}
                        disabled={disabled}
                        onChange={(e) => updateField("telefono", e.target.value)}
                    />
                </div>

                <div className={shared.inputGroup}>
                    <div className={shared.inputLabel}>Dirección</div>
                    <input
                        className={shared.input}
                        value={negocioForm.direccion}
                        disabled={disabled}
                        onChange={(e) => updateField("direccion", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}