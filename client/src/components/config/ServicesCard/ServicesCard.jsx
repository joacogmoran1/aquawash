
// Components
import { Icon } from "../../Icon/Icon";
import { EmptyState } from "../../EmptyState/EmptyState";

// Utils
import { sanitizeText, sanitizePrice, sanitizeInteger } from "../../../utils/config/configSanitizers";

// Style
import shared from "../../../styles/config/SharedCard.module.css";
import styles from "../../../styles/config/ServicesCard.module.css";

const EMPTY_SERVICIO_FORM = {
    nombre: "",
    precio: "",
    capacidad_por_hora: "",
    duracion_estimada_min: "",
};

export function ServicesCard({
    operacion,
    form,
    setForm,
    editing,
    setEditing,
    saveServicio,
    saving,
    deleteServicio,
}) {
    function resetForm() {
        setEditing(null);
        setForm(EMPTY_SERVICIO_FORM);
    }

    function loadServicioIntoForm(servicio) {
        setForm({
            nombre: sanitizeText(servicio.nombre),
            precio: sanitizePrice(String(servicio.precio ?? "")),
            capacidad_por_hora: sanitizeInteger(String(servicio.capacidad_por_hora ?? "")),
            duracion_estimada_min: sanitizeInteger(
                String(servicio.duracion_estimada_min ?? "")
            ),
        });
        setEditing(servicio.id);
    }

    return (
        <div className={`${shared.card} ${shared.cardFill} ${styles.servicesCard}`}>
            <div className={shared.sectionHeaderNoBorder}>
                <div className={shared.sectionTitle}>Nuestros Servicios</div>
            </div>

            <div className={styles.serviceForm}>
                <div className={styles.serviceToolbar}>
                    <div className={`${shared.inputGroup} ${styles.flexOne}`}>
                        <div className={shared.inputLabel}>Servicio</div>
                        <input
                            className={shared.input}
                            placeholder="Ej. Lavado básico"
                            value={form.nombre}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    nombre: sanitizeText(e.target.value),
                                }))
                            }
                        />
                    </div>

                    <div className={`${shared.inputGroup} ${styles.priceGroup}`}>
                        <div className={shared.inputLabel}>Precio</div>
                        <div className={styles.priceInputWrap}>
                            <span className={styles.priceSymbol}>$</span>
                            <input
                                className={`${shared.input} ${styles.flexOne}`}
                                placeholder="0"
                                type="text"
                                inputMode="decimal"
                                value={form.precio}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        precio: sanitizePrice(e.target.value),
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className={`${shared.inputGroup} ${styles.capacityGroup}`}>
                        <div className={shared.inputLabel}>Autos / hora</div>
                        <input
                            className={shared.input}
                            placeholder="1"
                            type="text"
                            inputMode="numeric"
                            value={form.capacidad_por_hora}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    capacidad_por_hora: sanitizeInteger(e.target.value),
                                }))
                            }
                        />
                    </div>

                    <div className={`${shared.inputGroup} ${styles.durationGroup}`}>
                        <div className={shared.inputLabel}>Duración (min)</div>
                        <input
                            className={shared.input}
                            placeholder="30"
                            type="text"
                            inputMode="numeric"
                            value={form.duracion_estimada_min}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    duracion_estimada_min: sanitizeInteger(e.target.value),
                                }))
                            }
                        />
                    </div>
                </div>

                <div className={styles.serviceActions}>
                    <button
                        className={`${shared.primaryButton} ${shared.fullWidthButton}`}
                        onClick={saveServicio}
                        disabled={saving}
                    >
                        <Icon name={editing ? "save" : "plus"} size={13} />
                        {editing ? "Guardar servicio" : "Agregar servicio"}
                    </button>

                    {editing && (
                        <button
                            className={`${shared.ghostButton} ${shared.fullWidthButton}`}
                            onClick={resetForm}
                        >
                            <Icon name="x" size={13} />
                            Cancelar edición
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.servicesContent}>
                {(operacion.Servicios || []).length === 0 ? (
                    <EmptyState icon="🔧" text="No hay servicios configurados" />
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Servicio</th>
                                <th className={styles.thRight}>Precio</th>
                                <th className={styles.thRight}>Autos / hora</th>
                                <th className={styles.thRight}>Duración</th>
                                <th className={styles.thAction}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(operacion.Servicios || []).map((s) => (
                                <tr key={s.id}>
                                    <td>{s.nombre}</td>
                                    <td className={styles.priceCell}>
                                        ${Number(s.precio || 0).toFixed(2)}
                                    </td>
                                    <td className={styles.priceCell}>
                                        {Number(s.capacidad_por_hora || 0)}
                                    </td>
                                    <td className={styles.priceCell}>
                                        {Number(s.duracion_estimada_min || 0)} min
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.rowActions}>
                                            <button
                                                className={shared.ghostButtonSm}
                                                onClick={() => loadServicioIntoForm(s)}
                                            >
                                                <Icon name="edit" size={13} color="var(--muted2)" />
                                            </button>

                                            <button
                                                className={shared.dangerButtonSm}
                                                onClick={() => deleteServicio(s.id)}
                                            >
                                                <Icon name="trash" size={13} color="var(--red)" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}