// Components
import { Icon } from "../../Icon/Icon";

// Utils
import { initials } from "../../../utils/dateUtils";
import { formatLastVisit } from "../../../utils/clientsHelpers";

// Style
import shared from "../../../styles/clients/ClientsShared.module.css";
import styles from "../../../styles/clients/ClientsTable.module.css";

export function ClientsTable({
    processedClients,
    setSelectedId,
    handleDelete,
}) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Vehículos</th>
                        <th>Visitas</th>
                        <th>Última visita</th>
                        <th>Desde</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {processedClients.map((c) => (
                        <tr
                            key={c.id}
                            className={styles.tableRowClickable}
                            onClick={() => setSelectedId(c.id)}
                        >
                            <td>
                                <div className={styles.clientNameCell}>
                                    <div className={styles.clientAvatar}>{initials(c.nombre)}</div>
                                    <div className={styles.clientInfo}>
                                        <div className={styles.clientNameText}>{c.nombre}</div>
                                    </div>
                                </div>
                            </td>

                            <td className={styles.monoMutedText}>{c.telefono || "—"}</td>
                            <td className={styles.emailText}>{c.email || "—"}</td>

                            <td>
                                <span className={`${shared.badge} ${shared.badgeCyan}`}>
                                    {(c.Autos || []).length} auto{(c.Autos || []).length !== 1 ? "s" : ""}
                                </span>
                            </td>

                            <td>
                                <span className={`${shared.badge} ${shared.badgeCyan}`}>
                                    {c.cantidad_visitas || 0}
                                </span>
                            </td>

                            <td className={styles.dateText}>
                                {formatLastVisit(c.ultima_visita)}
                            </td>

                            <td className={styles.dateText}>
                                {/* FIX: Sequelize devuelve createdAt (camelCase) */}
                                {(c.createdAt || c.created_at)
                                    ? new Date(c.createdAt || c.created_at).toLocaleDateString("es-AR")
                                    : "—"}
                            </td>

                            <td onClick={(e) => e.stopPropagation()}>
                                <button
                                    className={`${shared.btn} ${shared.btnDanger} ${shared.btnSm}`}
                                    onClick={() => handleDelete(c.id)}
                                >
                                    <Icon name="trash" size={13} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}